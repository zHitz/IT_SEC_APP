FROM node:24-alpine AS build
WORKDIR /source
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY backend/src/ ./backend/src/
COPY backend/db/ ./backend/db/
COPY frontend/src/ ./frontend/src/
COPY scripts/build.mjs ./scripts/build.mjs
RUN node scripts/build.mjs
FROM node:24-alpine
WORKDIR /app
COPY --from=build --chown=node:node /source/backend/dist/ ./backend/dist/
COPY --from=build --chown=node:node /source/node_modules/ ./node_modules/
RUN mkdir -p /app/var/osquery/raw && chown -R node:node /app/var
USER node
CMD ["node", "backend/dist/server.mjs"]
