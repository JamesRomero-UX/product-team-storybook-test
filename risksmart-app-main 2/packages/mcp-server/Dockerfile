# Stage 1: Build
FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy workspace configuration (good cache layer)
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy only package.json for dependency caching
COPY ./packages/mcp-server/package.json ./packages/mcp-server/package.json
COPY ./packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY ./packages/modules/package.json ./packages/modules/package.json

# Install dependencies
RUN pnpm install --filter @risksmart-app/mcp-server... --frozen-lockfile --shamefully-hoist

# Copy source
COPY ./packages/eslint-config ./packages/eslint-config
COPY ./packages/modules ./packages/modules
COPY ./packages/mcp-server ./packages/mcp-server

# Build
WORKDIR /app/packages/mcp-server
RUN pnpm build
WORKDIR /app

# Pruned stage - minimal production deployment
FROM builder AS pruned
RUN pnpm --filter @risksmart-app/mcp-server --prod deploy pruned --legacy

# Remove unnecessary files from node_modules
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
        -name "examples" \
    \) -exec rm -rf {} + 2>/dev/null || true

# Final stage - minimal Alpine runtime
FROM node:22-alpine AS runtime

# Create non-root user
RUN addgroup -g 1001 -S app && \
    adduser -u 1001 -S app -G app

WORKDIR /app
ENV NODE_ENV=production

# Remove npm and corepack (not needed at runtime, eliminates bundled CVEs)
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=pruned --chown=app:app /app/pruned .

USER app

EXPOSE 8022

CMD ["node", "dist/app.js"]
