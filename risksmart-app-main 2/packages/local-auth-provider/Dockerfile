# Multi-stage build for production
FROM node:22 AS build

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
COPY ./packages/local-auth-provider ./packages/local-auth-provider

# Install dependencies & build app
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @risksmart-app/local-auth-provider run build

#######################

# Build stage
FROM build AS pruned
RUN pnpm --filter=@risksmart-app/local-auth-provider deploy pruned --legacy

#######################

# Production stage
FROM node:22-slim AS production

# Create non-root user
RUN addgroup --gid 1001 nodejs
RUN adduser --uid 1001 --gid 1001 --disabled-password --gecos "" nodejs

# Add required packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=pruned --chown=nodejs:nodejs /app/pruned .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3232