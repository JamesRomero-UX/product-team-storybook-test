import { execSync } from 'child_process';

export const setup = () => {
  // In CI, tests run against local Lambda HTTP servers started by the workflow,
  // not the Docker container, so skip container setup
  if (process.env.CI) {
    return;
  }

  // Restart SAM first — dev.js's restartTrpc() will restart the tRPC container,
  // but we override it immediately after with stub PDP settings.
  execSync('pnpm backend:api-test:sam', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  execSync('pnpm docker:compose:api-test:trpc', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
};

export const teardown = () => {
  if (!process.env.CI) {
    execSync('pnpm docker:compose:trpc', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    execSync('pnpm backend:sam', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  }
};
