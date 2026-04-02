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

- Auth uses in-memory users and refresh sessions.
- Agents, chat history, and tasks use in-memory storage.
- LLM execution and task execution are stubbed in src/services/execution.ts.

Replace the execution service and the in-memory store with your own database and inference code.