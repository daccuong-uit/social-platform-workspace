const origin = process.env.KEYCLOAK_INTERNAL_URL ?? 'http://keycloak:8080';
const username = process.env.KEYCLOAK_ADMIN ?? 'admin';
const password = process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin';
const realm = 'reals';
const passkeyFlowAlias = 'browser-reals-passkeys';
let accessToken = '';

async function waitForAdmin() {
  const tokenUrl = new URL('/realms/master/protocol/openid-connect/token', origin);
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username,
          password,
        }),
      });
      if (response.ok) {
        accessToken = (await response.json()).access_token;
        return;
      }
    } catch {
      // Keycloak may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('Keycloak admin API did not become ready');
}

async function adminRequest(path, { method = 'GET', body, allowNotFound = false } = {}, targetRealm = realm) {
  const response = await fetch(new URL(`/admin/realms/${targetRealm}${path}`, origin), {
    method,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Keycloak Admin API ${method} ${path} failed (${response.status}): ${detail}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function waitForRealm() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if (await adminRequest('')) return;
    } catch {
      // Realm import may finish after the Admin API is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('Keycloak realm reals was not imported');
}

async function ensureDefaultClientScopes() {
  const scopeNames = ['basic', 'profile', 'email', 'roles', 'web-origins', 'acr'];
  const clientIds = ['gateway-bff', 'iam-web', 'social-web', 'video-web', 'shop-web', 'stories-web', 'portfolio-web'];
  const [realmScopes, masterScopes, clients] = await Promise.all([
    adminRequest('/client-scopes'),
    adminRequest('/client-scopes', {}, 'master'),
    adminRequest('/clients'),
  ]);

  for (const name of scopeNames) {
    let scope = realmScopes.find((item) => item.name === name);
    if (!scope) {
      const masterScope = masterScopes.find((item) => item.name === name);
      if (!masterScope) throw new Error(`Keycloak built-in client scope is missing: ${name}`);

      const definition = structuredClone(masterScope);
      delete definition.id;
      delete definition.containerId;
      for (const mapper of definition.protocolMappers ?? []) {
        delete mapper.id;
        delete mapper.containerId;
      }
      await adminRequest('/client-scopes', { method: 'POST', body: definition });
      scope = (await adminRequest('/client-scopes')).find((item) => item.name === name);
      if (!scope) throw new Error(`Could not create Keycloak client scope: ${name}`);
    }

    for (const clientId of clientIds) {
      const client = clients.find((item) => item.clientId === clientId);
      if (!client) throw new Error(`Keycloak OIDC client is missing: ${clientId}`);
      const assignedScopes = await adminRequest(`/clients/${client.id}/default-client-scopes`);
      if (!assignedScopes.some((item) => item.id === scope.id)) {
        await adminRequest(`/clients/${client.id}/default-client-scopes/${scope.id}`, { method: 'PUT' });
      }
    }
  }
  console.log('Ensured standard OIDC scopes on Reals web clients');
}

async function configureIdentityProvider(alias, providerId, config) {
  if (!config.clientId && !config.clientSecret) return;
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`Both ${alias.toUpperCase()} client ID and client secret are required`);
  }

  const existing = await adminRequest(`/identity-provider/instances/${alias}`, { allowNotFound: true });
  const provider = {
    ...(existing ?? {}),
    alias,
    providerId,
    enabled: true,
    trustEmail: true,
    syncMode: 'IMPORT',
    config: { ...(existing?.config ?? {}), ...config },
  };
  await adminRequest(`/identity-provider/instances${existing ? `/${alias}` : ''}`, {
    method: existing ? 'PUT' : 'POST',
    body: provider,
  });
  console.log(`Configured Keycloak identity provider: ${alias}`);
}

async function enablePasskeyBrowserFlow() {
  const flows = await adminRequest('/authentication/flows');
  let flow = flows.find((item) => item.alias === passkeyFlowAlias);
  if (!flow) {
    await adminRequest('/authentication/flows/browser/copy', {
      method: 'POST',
      body: { newName: passkeyFlowAlias },
    });
    flow = (await adminRequest('/authentication/flows')).find((item) => item.alias === passkeyFlowAlias);
  }
  if (!flow) throw new Error('Could not create the passkey browser flow');

  let executions = await adminRequest(`/authentication/flows/${encodeURIComponent(passkeyFlowAlias)}/executions`);
  let passkey = executions.find((execution) => execution.providerId === 'webauthn-authenticator-passwordless');
  if (!passkey) {
    await adminRequest(`/authentication/flows/${encodeURIComponent(passkeyFlowAlias)}/executions/execution`, {
      method: 'POST',
      body: { provider: 'webauthn-authenticator-passwordless', priority: 26 },
    });
    executions = await adminRequest(`/authentication/flows/${encodeURIComponent(passkeyFlowAlias)}/executions`);
    passkey = executions.find((execution) => execution.providerId === 'webauthn-authenticator-passwordless');
  }
  if (!passkey) throw new Error('Could not add passwordless WebAuthn to the browser flow');
  if (passkey.requirement !== 'ALTERNATIVE') {
    passkey.requirement = 'ALTERNATIVE';
    passkey.priority = 26;
    await adminRequest(`/authentication/flows/${encodeURIComponent(passkeyFlowAlias)}/executions`, {
      method: 'PUT',
      body: passkey,
    });
  }

  const realmConfig = await adminRequest('');
  if (realmConfig.browserFlow !== passkeyFlowAlias) {
    realmConfig.browserFlow = passkeyFlowAlias;
    await adminRequest('', { method: 'PUT', body: realmConfig });
  }
  console.log('Enabled passkey login as an alternative in the Keycloak Browser flow');
}

await waitForAdmin();
await waitForRealm();
await ensureDefaultClientScopes();
await configureIdentityProvider('google', 'google', {
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  defaultScope: 'openid email profile',
  useJwksUrl: 'true',
});
await configureIdentityProvider('apple', 'oidc', {
  clientId: process.env.APPLE_CLIENT_ID ?? '',
  clientSecret: process.env.APPLE_CLIENT_SECRET ?? '',
  authorizationUrl: 'https://appleid.apple.com/auth/authorize',
  tokenUrl: 'https://appleid.apple.com/auth/token',
  userInfoUrl: 'https://appleid.apple.com/auth/userinfo',
  issuer: 'https://appleid.apple.com',
  jwksUrl: 'https://appleid.apple.com/auth/keys',
  useJwksUrl: 'true',
  validateSignature: 'true',
  clientAuthMethod: 'client_secret_post',
  defaultScope: 'openid email name',
});
await enablePasskeyBrowserFlow();
