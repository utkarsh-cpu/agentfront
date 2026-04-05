# API Scaffold

This app provides a backend scaffold for the frontend routes already used by apps/web.

Routes included:

- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/agents
- GET /api/agents/:id
- POST /api/agents
- PATCH /api/agents/:id
- DELETE /api/agents/:id
- POST /api/agents/:id/run
- POST /api/agents/:id/chat
- GET /api/agents/:id/chat/history
- DELETE /api/agents/:id/chat/history
- GET /api/tasks
- GET /api/tasks/:id
- POST /api/tasks/:id/cancel

Current behavior:

- Persistence uses Prisma with a local SQLite database.
- Auth, agents, chat history, tasks, refresh sessions, and password resets are stored in the database.
- LLM execution and task execution are still stubbed in src/services/execution.ts.

Setup:

- Create apps/api/.env with `DATABASE_URL="file:./prisma/dev.db"`.
- Run `bun install` at the repo root.
- Run `bun run prisma:migrate` from apps/api to create the database.
- Run `bun run prisma:generate` from apps/api if you need to regenerate the Prisma client.