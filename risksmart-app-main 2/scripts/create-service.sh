#!/bin/bash
SERVICE_NAME=$1
if [ -z "$SERVICE_NAME" ]; then
  echo "Usage: ./scripts/create-service.sh <service-name>"
  exit 1
fi

SERVICE_DIR="services/${SERVICE_NAME}"
mkdir -p "$SERVICE_DIR"

# Create directory structure
mkdir -p "$SERVICE_DIR/src"/{handlers,domain,adaptors}
mkdir -p "$SERVICE_DIR/test"

# Create package.json
cat > "$SERVICE_DIR/package.json" <<EOF
{
  "name": "@risksmart-app/${SERVICE_NAME}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test:unit": "vitest --run --project unit",
    "test:integration": "vitest --run --project int",
    "tsc": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix"
  },
  "devDependencies": {
    "@risksmart-app/eslint-config": "workspace:*",
    "@tsconfig/node16": "catalog:",
    "@types/node": "catalog:",
    "@vitest/coverage-v8": "catalog:",
    "typescript": "catalog:",
    "vite-tsconfig-paths": "catalog:",
    "vitest": "catalog:"
  },
  "dependencies": {
    "@aws-lambda-powertools/logger": "catalog:",
    "@aws-lambda-powertools/metrics": "catalog:",
    "@aws-lambda-powertools/tracer": "catalog:",
    "@risksmart-app/shared": "workspace:*",
    "@sentry/aws-serverless": "catalog:",
    "zod": "catalog:"
  }
}
EOF

# Create tsconfig.json
cat > "$SERVICE_DIR/tsconfig.json" <<EOF
{
  "extends": "@tsconfig/node16/tsconfig.json",
  "compilerOptions": {
    "module": "esnext",
    "target": "es2022",
    "moduleResolution": "node",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

# Create vitest.config.ts
cat > "$SERVICE_DIR/vitest.config.ts" <<EOF
import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: [
      ...configDefaults.exclude,
      '**/test/**',
      '**/*.integration.test.ts',
    ],
    env: {
      STAGE: 'test',
      NODE_ENV: 'test',
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
        },
      },
      {
        test: {
          name: 'int',
          globals: true,
          environment: 'node',
          setupFiles: ['dotenv/config'],
          env: {
            STAGE: 'test',
            NODE_ENV: 'test',
          },
          include: ['**/*.integration.test.ts'],
          exclude: [...configDefaults.exclude, '**/test/**'],
        },
      },
    ],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    sourcemap: 'both',
  },
});
EOF

# Create .gitignore
cat > "$SERVICE_DIR/.gitignore" <<EOF
generated
vite.config.ts.timestamp-*.mjs

# testing
coverage

# CDK compiled output
src/**/*.js
src/**/*.js.map
EOF

# Create eslint.config.js
cat > "$SERVICE_DIR/eslint.config.js" <<EOF
import { globalIgnores } from 'eslint/config';
import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(['**/*.js', '**/*.js.map', '**/*.d.ts', '**/cdk.out/*']),
  ...esmConfigTyped,
  {
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'max-params': ['warn', 7],
      // Custom rule to enforce kebab-case file naming
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            // Allow specific patterns that should not be kebab-case
            '^[A-Z][a-zA-Z0-9]*\\.tsx?$', // Allow PascalCase for React components
          ],
        },
      ],
    },
  },
];
EOF

# Create README
cat > "$SERVICE_DIR/README.md" <<EOF
# ${SERVICE_NAME}

## Development

\`\`\`bash
pnpm install
pnpm run test:unit
pnpm run tsc
\`\`\`
EOF

echo "✅ Created service: $SERVICE_DIR"
echo "Next steps:"
echo "  1. cd $SERVICE_DIR"
echo "  2. pnpm install"
echo "  3. Create your handlers in src/handlers/"
echo "  Please review the contribution guide at docs/style-guides/clean-architecture.md"
