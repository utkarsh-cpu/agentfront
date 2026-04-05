# syntax=docker/dockerfile:1

# ── Stage 1: Prune the monorepo ──────────────────────────────────────
FROM oven/bun:1.2.20-alpine AS pruner
WORKDIR /app
RUN bun add -g turbo@^2
COPY . .
RUN turbo prune api --docker

# ── Stage 2: Install dependencies ────────────────────────────────────
FROM oven/bun:1.2.20-alpine AS installer
WORKDIR /app

# Install pruned lockfile + package.jsons first (cache layer)
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile

# Copy pruned source and build
COPY --from=pruner /app/out/full/ .
RUN bunx turbo db:generate && bunx turbo build --filter=api...

# ── Stage 3: Production runner ───────────────────────────────────────
FROM oven/bun:1.2.20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy only what's needed to run
COPY --from=installer /app/ .

USER appuser

ENV NODE_ENV=production
EXPOSE 3001

CMD ["bun", "run", "apps/api/src/index.ts"]
