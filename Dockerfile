FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/scripts/admin-setup.mjs /app/scripts/admin-account.mjs /app/scripts/backup-postgres.mjs /app/scripts/load-env.mjs ./scripts/
COPY --from=build --chown=node:node /app/lib/postgres.ts ./lib/postgres.ts
RUN mkdir -p /app/data /app/backups && chown node:node /app/data /app/backups
USER node
EXPOSE 3000
CMD ["node","server.js"]
