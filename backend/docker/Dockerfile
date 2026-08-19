# Build context MUST be the repo root (`docker build -f backend/docker/Dockerfile .`)
# — this is an npm workspaces monorepo, so `npm ci` needs every workspace's
# package.json to resolve the root package-lock.json, even scoped to one
# workspace via `--workspace backend` (which installs only backend's own
# dependency subtree, not frontend/admin-frontend's).
#
# Deliberately NOT at backend/Dockerfile: Railway (which deploys this
# service via Nixpacks, see backend/railway.json) always prefers a
# Dockerfile over railway.json's builder setting if it finds one in the
# service root — no config field can override that. A Dockerfile sitting
# right at backend/Dockerfile silently hijacked every Railway deploy from
# here on out (production ran a stale build for hours as a result).

FROM node:22-alpine AS base
# Prisma's query engine is generated against whatever OpenSSL version it can
# detect at `prisma generate` time (during `npm ci`'s postinstall hook) —
# without it here it silently guesses wrong and mismatches the openssl
# actually installed in the runtime stage below.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY admin-frontend/package.json ./admin-frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
# `npm ci` below runs backend's `postinstall: prisma generate`, which needs
# the schema present — copied ahead of the full `backend ./backend` copy so
# this layer stays cached unless the schema itself changes.
COPY backend/prisma ./backend/prisma

FROM base AS build
RUN npm ci --workspace backend
COPY backend ./backend
RUN npm run build --workspace backend

FROM base AS prod-deps
RUN npm ci --workspace backend --omit=dev

FROM node:22-alpine AS runtime
# Prisma's query engine binary is dynamically linked against OpenSSL, which
# the alpine base image doesn't ship — without it the engine fails at
# startup with an opaque "Could not parse schema engine response" error.
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/prisma ./backend/prisma
COPY backend/package.json ./backend/package.json

WORKDIR /app/backend
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Applies pending Prisma migrations, then starts the compiled server —
# mirrors railway.json's existing deploy.startCommand.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
