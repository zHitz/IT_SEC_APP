FROM node:24-alpine AS build
WORKDIR /source
COPY backend/src/ ./backend/src/
COPY backend/db/ ./backend/db/
COPY frontend/src/ ./frontend/src/
COPY scripts/build.mjs ./scripts/build.mjs
RUN node scripts/build.mjs
FROM node:24-alpine
WORKDIR /app
COPY --from=build --chown=node:node /source/frontend/dist/ ./frontend/dist/
COPY --chown=node:node frontend/server.mjs ./frontend/server.mjs
COPY --chown=node:node backend/src/config.mjs ./backend/src/config.mjs
USER node
CMD ["node", "frontend/server.mjs"]
