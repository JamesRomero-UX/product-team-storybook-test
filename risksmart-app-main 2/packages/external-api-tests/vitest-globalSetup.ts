import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export function setup() {
  execSync('docker compose --profile v3 up -d --wait', {
    stdio: 'inherit',
    cwd: repoRoot,
  });
}

export function teardown() {
  if (!process.env.CI && process.env.DISABLE_DOCKER_DOWN !== 'true') {
    execSync('docker compose --profile v3 down', {
      stdio: 'inherit',
      cwd: repoRoot,
    });
  }
}
