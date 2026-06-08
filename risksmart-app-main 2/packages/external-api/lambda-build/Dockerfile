FROM node:22 AS build

RUN apt-get update && apt-get install -y --no-install-recommends zip \
  && rm -rf /var/lib/apt/lists/*

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN corepack prepare pnpm@10.27.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration first
COPY pnpm-workspace.yaml ./
# Copy root package.json (needed for workspace resolution)
COPY package.json ./
# Copy pnpm lockfile for frozen deps
COPY pnpm-lock.yaml ./

# Copy Ext API package files
COPY ./packages/eslint-config ./packages/eslint-config
COPY ./packages/trpc ./packages/trpc
COPY ./packages/schedule-state ./packages/schedule-state
COPY ./packages/external-api ./packages/external-api

# Install dependencies & build app
RUN npm i -g esbuild
RUN pnpm install --frozen-lockfile


ENV ENTRY="src/lambdas/cognito-pre-token/index.ts"
ENV OUTFILE="dist/index.cjs"

# Build + zip when the container runs (ENTRY and VERSION are respected)
CMD esbuild "$ENTRY" \
      --bundle --platform=node --target=node22 --format=cjs --minify \
      --outfile="$OUTFILE" \
 && mkdir -p /workspace/artifacts \
 && cd dist \
 && zip -r /workspace/artifacts/${VERSION:-dev}.zip .