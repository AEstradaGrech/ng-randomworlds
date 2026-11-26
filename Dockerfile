# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Dependencies first: this layer is reused while package*.json don't change
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Source code
COPY . .

ARG BUILD_CONFIGURATION=production
RUN npx ng build --configuration ${BUILD_CONFIGURATION}

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5400

# Only the build output: the server bundle is self-contained
COPY --from=build --chown=node:node /app/dist/ng-randomworlds ./dist

USER node
EXPOSE 5400
CMD ["node", "dist/server/server.mjs"]