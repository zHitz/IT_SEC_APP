FROM node:24-alpine AS build
WORKDIR /source
COPY backend/src/ ./backend/src/
COPY frontend/src/ ./frontend/src/
COPY scripts/build.mjs ./scripts/build.mjs
RUN node scripts/build.mjs
FROM node:24-alpine
WORKDIR /app
COPY --from=build --chown=node:node /source/backend/dist/ ./backend/dist/
USER node
CMD ["node", "backend/dist/server.mjs"]
