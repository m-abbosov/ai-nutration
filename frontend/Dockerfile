# Build context MUST be the repo root (`docker build -f frontend/Dockerfile .`)
# — npm workspaces need every workspace's package.json to resolve the root
# lockfile, and this app imports @nutriai/shared as TS source (no build
# step of its own — see packages/shared/package.json's `exports`).
#
# Vite bakes VITE_* vars into the JS bundle at build time, not runtime — pass
# them with --build-arg, e.g.:
#   docker build -f frontend/Dockerfile --build-arg VITE_API_URL=https://api.example.com/api .

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
COPY admin-frontend/package.json ./admin-frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci --workspace frontend

COPY packages/shared ./packages/shared
COPY frontend ./frontend

ARG VITE_API_URL
ARG VITE_TELEGRAM_BOT_USERNAME
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TELEGRAM_BOT_USERNAME=$VITE_TELEGRAM_BOT_USERNAME
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/ || exit 1
