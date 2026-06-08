# Stage 1: Build stage with workspace context
FROM node:22
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy workspace configuration first
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
# Copy root package.json (needed for workspace resolution)
COPY package.json ./

# Copy the specific package's files
COPY ./packages/trpc-api-tests/package.json ./packages/trpc-api-tests/package.json
COPY ./packages/eslint-config ./packages/eslint-config
COPY ./services/tenant-configuration ./services/tenant-configuration

# Install ALL dependencies for the specific package, resolving catalogs
# Includes devDependencies like typescript needed for the build
RUN pnpm install --filter trpc-api-tests --frozen-lockfile

COPY ./packages/trpc-api-tests ./packages/trpc-api-tests
RUN pnpm run build:stub-pdp

WORKDIR /app/packages/trpc-api-tests

USER node

EXPOSE 8010
