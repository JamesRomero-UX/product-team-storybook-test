# Multi-stage build for production
FROM node:22-alpine AS build

# Accept version as build argument
ARG PACKAGE_VERSION
ENV PACKAGE_VERSION=${PACKAGE_VERSION}

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
COPY ./packages/domain ./packages/domain
COPY ./packages/trpc ./packages/trpc
COPY ./packages/schedule-state ./packages/schedule-state
COPY ./packages/permitio ./packages/permitio
COPY ./packages/drizzle ./packages/drizzle
COPY ./packages/events ./packages/events
COPY ./packages/external-api ./packages/external-api
COPY ./services/tenant-configuration ./services/tenant-configuration
COPY ./packages/form-configuration ./packages/form-configuration
COPY ./packages/modules ./packages/modules

# Install dependencies & build app
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @risksmart-app/external-api run build


#######################

# Build stage
FROM build AS pruned
RUN pnpm --filter=@risksmart-app/external-api --prod deploy pruned --legacy
#######################

# Production stage
FROM node:22-alpine AS production

# Accept version & environment from build stage
ARG PACKAGE_VERSION
ENV PACKAGE_VERSION=${PACKAGE_VERSION}

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# Set working directory
WORKDIR /app

ENV NODE_ENV=production

# Remove npm and corepack (not needed at runtime, eliminates bundled CVEs)
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

# Copy built application
COPY --from=pruned --chown=nodejs:nodejs /app/pruned .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3200
