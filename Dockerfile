FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build && npm prune --omit=dev && mv dist/server.cjs dist/server.cjs.map /app/

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production DB_FILE=/app/data/db_store.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.cjs /app/server.cjs.map ./
RUN install -d -o node -g node /app/data
USER node
EXPOSE 3000
CMD ["node", "server.cjs"]
