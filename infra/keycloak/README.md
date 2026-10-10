# Keycloak Local Configuration

The root Compose stack imports `realm-export.json` the first time it initializes the Keycloak database. The Admin Console is bound to `127.0.0.1:8080`; the checked-in credentials in `.env.example` are for local development only. Use unique passwords and production hostnames outside a developer machine.

The realm enables password login, TOTP policy/actions, WebAuthn registration policies, PKCE clients, and the API audience mapper. A one-shot Admin REST configurator clones Keycloak's built-in Browser flow, adds passwordless WebAuthn as an alternative, and enables Google and Apple only when both provider credentials are set in the untracked root `.env`:

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET`

Register these callback URLs with the providers:

- `https://<keycloak-host>/realms/reals/broker/google/endpoint`
- `https://<keycloak-host>/realms/reals/broker/apple/endpoint`

For local Google setup, use `http://localhost:8080/realms/reals/broker/google/endpoint`. Apple client secrets must be generated as required by Sign in with Apple. After setting credentials, run `docker compose up -d keycloak keycloak-idp-config`. The init job is idempotent and does not print credential values.

The imported redirect URIs in the realm export are local defaults for ports 3000 and 4200-4205. For another deployment, update the six client redirect URIs, post-logout URIs, Gateway callback/origin mappings, and `KEYCLOAK_PUBLIC_URL` together. Existing realms in a persistent database are not overwritten by `--import-realm`; apply later realm changes through the Admin Console or an explicit migration rather than deleting persisted data.
