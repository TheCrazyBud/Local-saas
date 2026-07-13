# Changelog

## [Unreleased] - 2026-07-13

### Added
- **Prisma ORM Integration**: Setup PostgreSQL schema defining `Deployment`, `Agent`, `ActionApproval`, and `AuditLog` models in `control-plane`.
- **Dynamic Next.js UI**: Refactored static UI mockups to fetch live data from the database using React Server Components.
- **Server Actions**: Migrated placeholder buttons to execute Next.js Server Actions for instant data mutation and UI revalidation.
- **Human-in-the-Loop (HITL) Engine**: Created the `/approvals` dashboard in the Control Plane where admins can review and approve high-risk actions requested by AI agents.
- **Agent Tool Registry**: Updated the HR Agent to dynamically process low-risk tasks instantly (mock Jira) and high-risk tasks securely (mock Active Directory requiring HITL approval).
- **Redis Token Caching**: Overhauled the LLM Privacy Gateway to be completely stateless. It now generates secure UUID tokens and caches the mapping in a distributed Redis cluster with automatic TTL expiration.
- **NextAuth SSO**: Implemented `next-auth` to secure the entire Control Plane dashboard, routing unauthenticated traffic to a login portal.
- **API Key Security**: Locked down the Python Data Plane (`llm-gateway` and `hr-agent`) globally using FastAPI Dependency Injection. All requests must now supply a valid `X-API-Key` header.
- **Immutable Audit Logging**: Enforced database-level audit logs for every sensitive action performed in the Control Plane.

### Changed
- Replaced the static layout sidebar in the Next.js frontend with a dynamic `Sidebar` component.
- Updated `docker-compose.yml` to include a `redis` service for the LLM Privacy Gateway.
- Upgraded `requirements.txt` across Python services to support the new features.
