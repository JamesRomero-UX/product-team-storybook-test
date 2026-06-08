# Stage 1: Build stage with workspace context
FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy workspace configuration first
COPY ./pnpm-workspace.yaml ./
COPY ./pnpm-lock.yaml ./
COPY ./package.json ./

# Copy the specific package's files
COPY ./packages/tenant-deployer/package.json ./packages/tenant-deployer/package.json
COPY ./services/request-state-api/package.json ./services/request-state-api/package.json
COPY ./packages/eslint-config ./packages/eslint-config
COPY ./packages/shared/package.json ./packages/shared/package.json

# Install dependencies for the tenant-deployer package (include devDependencies for build stage)
RUN pnpm install --filter @risksmart-app/tenant-deployer --filter @risksmart-app/request-state-api --filter @risksmart-app/shared --frozen-lockfile --ignore-scripts

# Copy the tenant-deployer source code
COPY ./packages/tenant-deployer ./packages/tenant-deployer
COPY ./services/request-state-api ./services/request-state-api
COPY ./packages/shared ./packages/shared

# Build the TypeScript code
WORKDIR /app/packages/tenant-deployer
RUN pnpm run build

# Stage 2: Production stage - minimal Alpine runtime
FROM node:22-alpine AS runtime

# Install AWS CLI v2 and bash (CDK NodejsFunction bundling requires bash)
RUN apk add --no-cache aws-cli=2.32.7-r0 bash=5.3.3-r1

# Install pnpm in runtime stage (needed for entrypoint)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.27.0 --activate

# Create non-root user
RUN addgroup -g 1001 -S deployer && \
    adduser -u 1001 -S deployer -G deployer

WORKDIR /app

# Copy package.json files and workspace config
COPY ./pnpm-workspace.yaml ./
COPY ./pnpm-lock.yaml ./
COPY ./package.json ./
COPY ./packages/tenant-deployer/package.json ./packages/tenant-deployer/package.json
COPY ./packages/shared/package.json ./packages/shared/package.json
COPY ./services/request-state-api/package.json ./services/request-state-api/package.json
COPY ./packages/eslint-config ./packages/eslint-config

# Install production dependencies
RUN pnpm install --filter @risksmart-app/tenant-deployer --filter @risksmart-app/request-state-api --filter @risksmart-app/shared --frozen-lockfile --prod --ignore-scripts

# Remove npm (not needed at runtime, eliminates bundled CVEs)
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Copy built artifacts and source files from builder stage
COPY --from=builder /app/packages/tenant-deployer ./packages/tenant-deployer
COPY --from=builder /app/services/request-state-api ./services/request-state-api
COPY --from=builder /app/packages/shared ./packages/shared

# Fix ownership for non-root user
RUN chown -R deployer:deployer /app

# Set environment variables
ENV NODE_ENV=production

# Set working directory to tenant-deployer package
WORKDIR /app/packages/tenant-deployer

USER deployer

# Use tsx to run the TypeScript deployer directly (since tsx is already installed)
ENTRYPOINT ["pnpm", "run", "docker:deploy"]
