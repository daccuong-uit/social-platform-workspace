# Frontend Repositories

The frontend is split into six independent client repositories:

| Repository | Responsibility |
| --- | --- |
| `social-web-client` | Social product client (existing) |
| `video-web-client` | Video discovery, playback and creator tools |
| `shop-web-client` | Product discovery and checkout |
| `stories-web-client` | Reading, collections and publishing |
| `iam-web-client` | Main landing, login and registration |
| `portfolio-web-client` | Independent developer portfolio |

Each client has its own `package.json`, Angular build configuration and Git repository. Cross-client communication should use public contracts or deployed URLs, not relative imports across repositories.
