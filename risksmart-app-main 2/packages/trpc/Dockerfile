# Stage 1: Build stage with workspace context
FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy workspace configuration first (these change rarely - good cache layer)
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
# Copy root package.json (needed for workspace resolution)
COPY package.json ./

# Copy only package.json files first for dependency caching
COPY ./packages/trpc/package.json ./packages/trpc/package.json
COPY ./packages/permitio/package.json ./packages/permitio/package.json
COPY ./packages/drizzle/package.json ./packages/drizzle/package.json
COPY ./packages/events/package.json ./packages/events/package.json
COPY ./packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY ./services/tenant-configuration/package.json ./services/tenant-configuration/package.json
COPY ./packages/domain/package.json ./packages/domain/package.json
COPY ./packages/form-configuration/package.json ./packages/form-configuration/package.json
COPY ./packages/schedule-state/package.json ./packages/schedule-state/package.json


# Install only dependencies needed for trpc and its workspace dependencies
# Includes devDependencies like typescript needed for the build
RUN pnpm install --filter trpc... --frozen-lockfile --shamefully-hoist

# Now copy source files (these change frequently)
COPY ./packages/eslint-config ./packages/eslint-config
COPY ./packages/trpc ./packages/trpc
COPY ./packages/permitio ./packages/permitio
COPY ./packages/drizzle ./packages/drizzle
COPY ./packages/events ./packages/events
COPY ./services/tenant-configuration ./services/tenant-configuration
COPY ./packages/domain ./packages/domain
COPY ./packages/form-configuration ./packages/form-configuration
COPY ./packages/schedule-state ./packages/schedule-state

# Build all packages in parallel where possible
RUN cd /app/packages/domain && pnpm build && \
    cd /app/packages/permitio && pnpm build && \
    cd /app/packages/drizzle && pnpm build && \
    cd /app/packages/events && pnpm build && \
    cd /app/services/tenant-configuration && pnpm build && \
    cd /app/packages/form-configuration && pnpm build && \
    cd /app/packages/schedule-state && pnpm build
RUN pnpm run build:trpc

# Download RDS certificate bundle in builder stage
RUN wget -q https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O /tmp/rds-ca-global-bundle.pem

# Pruned stage - create minimal production deployment
FROM builder AS pruned
RUN pnpm --filter trpc --prod deploy pruned --legacy

# Copy compiled dist to src locations for runtime resolution
RUN cp -r /app/packages/domain/dist/* /app/pruned/node_modules/@risksmart-app/domain/src/ 2>/dev/null || true && \
    cp -r /app/packages/drizzle/dist/* /app/pruned/node_modules/@risksmart-app/drizzle/src/ 2>/dev/null || true && \
    cp -r /app/packages/permitio/dist/* /app/pruned/node_modules/@risksmart-app/permitio/src/ 2>/dev/null || true && \
    cp -r /app/packages/events/dist/* /app/pruned/node_modules/@risksmart-app/events/src/ 2>/dev/null || true && \
    cp -r /app/services/tenant-configuration/dist/* /app/pruned/node_modules/@risksmart-app/tenant-configuration/src/ 2>/dev/null || true && \
    cp -r /app/packages/form-configuration/dist/* /app/pruned/node_modules/@risksmart-app/form-configuration/src/ 2>/dev/null || true && \
    cp -r /app/packages/schedule-state/dist/* /app/pruned/node_modules/@risksmart-app/schedule-state/src/ 2>/dev/null || true

# Remove unnecessary files from node_modules to reduce image size
RUN find /app/pruned/node_modules -type f \( \
        -name "*.md" -o \
        -name "*.markdown" -o \
        -name "LICENSE*" -o \
        -name "CHANGELOG*" -o \
        -name "*.map" -o \
        -name "*.ts" ! -name "*.d.ts" -o \
        -name ".eslintrc*" -o \
        -name ".prettierrc*" -o \
        -name "tsconfig*.json" -o \
        -name ".editorconfig" -o \
        -name "yarn.lock" -o \
        -name "package-lock.json" \
    \) -delete 2>/dev/null || true && \
    find /app/pruned/node_modules -type d \( \
        -name "docs" -o \
        -name ".github" -o \
        -name ".vscode" -o \
        -name "test" -o \
        -name "tests" -o \
        -name "__tests__" -o \
        -name "examples" -o \
        -name ".husky" -o \
        -name ".terraform" -o \
        -name ".ignored_permitio" \
    \) -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf /app/pruned/node_modules/.pnpm/turbo-* 2>/dev/null || true

# Final stage - minimal Alpine runtime image
FROM node:22-alpine AS runtime

# Install ca-certificates for TLS verification
RUN apk add --no-cache ca-certificates=20251003-r0

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs -G nodejs

# Copy the RDS certificate bundle from builder (no wget needed at runtime)
RUN mkdir -p /etc/ssl/certs/aws
COPY --from=builder /tmp/rds-ca-global-bundle.pem /etc/ssl/certs/aws/rds-ca-global-bundle.pem

# Set the environment variable for Node.js to use the RDS certificate bundle
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/aws/rds-ca-global-bundle.pem

WORKDIR /app

ENV NODE_ENV=production

# Remove npm and corepack (not needed at runtime, eliminates bundled CVEs)
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=pruned --chown=nodejs:nodejs /app/pruned .

# Switch to non-root user
USER nodejs

EXPOSE 2021
EXPOSE 8000
