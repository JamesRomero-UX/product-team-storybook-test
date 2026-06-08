import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Duration } from 'aws-cdk-lib';
import type {
  ISecurityGroup,
  IVpc,
  SubnetSelection,
} from 'aws-cdk-lib/aws-ec2';
import type { IRole } from 'aws-cdk-lib/aws-iam';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

export interface LambdaFactoryProps {
  /** The CDK construct scope */
  scope: Construct;
  /** Unique identifier for the Lambda function */
  id: string;
  /** The Lambda function name */
  functionName: string;
  /** IAM role for the Lambda function */
  role: IRole;
  /** Path to the TypeScript entry file (relative to project root) */
  entryPath: string;
  /** The handler export name (defaults to 'handler') */
  handler?: string;
  /** Runtime environment (defaults to NODEJS_22_X) */
  runtime?: Runtime;
  /** Function timeout (defaults to 30 seconds) */
  timeout?: Duration;
  /** Memory allocation (defaults to 128 MB) */
  memorySize?: number;
  /** Environment variables */
  environment?: Record<string, string>;
  /** Additional NodejsFunction bundling options for production */
  bundlingOptions?: NodejsFunctionProps['bundling'];
  /** VPC configuration */
  vpc?: IVpc;
  /** Subnet selection */
  vpcSubnets?: SubnetSelection;
  /** Security groups */
  securityGroups?: ISecurityGroup[];
}

/**
 * Creates a Lambda function optimized for local development hot reloading
 * and proper TypeScript bundling in production environments.
 *
 * When BUCKET_MARKER_LOCAL=hot-reload is set:
 * - Uses raw Function construct with Code.fromBucket() for SAM/CDK local hot reloading
 * - Points to source directory for automatic file monitoring
 *
 * In production environments:
 * - Uses NodejsFunction for proper TypeScript compilation and bundling
 * - Includes tree-shaking, minification, and optimization
 */
export function createOptimizedLambda(props: LambdaFactoryProps): IFunction {
  const {
    scope,
    id,
    functionName,
    role,
    entryPath,
    handler = 'handler',
    runtime = Runtime.NODEJS_22_X,
    timeout = Duration.seconds(30),
    memorySize = 128,
    environment = {},
    bundlingOptions = {},
    vpc,
    vpcSubnets,
    securityGroups,
  } = props;

  const isLocalDev = process.env.BUCKET_MARKER_LOCAL === 'hot-reload';

  if (isLocalDev) {
    // For local hot reload: compile TypeScript to JavaScript in source directory
    // and create a Function that SAM/CDK local can hot reload
    const sourceDirectory = path.dirname(entryPath);
    const handlerFileName = path.basename(entryPath, '.ts');
    const jsOutput = path.join(sourceDirectory, `${handlerFileName}.js`);

    // Compile TypeScript to JavaScript in the source directory
    try {
      // Get the package directory containing tsconfig.json
      const packageDir = findPackageRoot(sourceDirectory);

      // Use esbuild for fast compilation compatible with local Lambda execution
      execSync(
        `npx esbuild "${entryPath}" --bundle --platform=node --target=node20 --format=cjs --outfile="${jsOutput}" --sourcemap`,
        { cwd: packageDir, stdio: 'inherit' }
      );

      const hotReloadBucket = Bucket.fromBucketName(
        scope,
        `HotReloadingBucket-${id}`,
        'hot-reload'
      );

      // For local hot reload, we use the special bucket marker
      // and point to the absolute source directory path
      const hotReloadFunction = new Function(scope, id, {
        functionName,
        runtime,
        role,
        timeout,
        memorySize,
        handler: `${handlerFileName}.${handler}`,
        // For local hot reload, we use fromBucket pointing to the compiled directory
        // The local Lambda runtime handles the hot reload mechanism
        code: Code.fromBucket(hotReloadBucket, path.resolve(sourceDirectory)),
        environment,
      });

      return hotReloadFunction;
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error(`Error compiling ${entryPath} for local Lambda execution`);
      throw error;
    }
  } else {
    // For production: use NodejsFunction with TypeScript compilation
    const defaultBundlingOptions: NodejsFunctionProps['bundling'] = {
      sourceMap: true,
      minify: true,
      target: 'ES2022',
      keepNames: true,
      ...bundlingOptions,
    };

    return new NodejsFunction(scope, id, {
      functionName,
      entry: entryPath,
      handler,
      runtime,
      role,
      timeout,
      memorySize,
      environment,
      bundling: defaultBundlingOptions,
      vpc,
      securityGroups,
      vpcSubnets,
    });
  }
}

/**
 * Find the package root directory containing package.json
 */
function findPackageRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    const packageJsonPath = path.join(dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error(`Could not find package.json starting from ${startDir}`);
}

/**
 * Utility to resolve absolute paths for Lambda entry points
 * Resolves paths relative to the monorepo root to access other packages
 */
export function resolveLambdaEntry(relativePath: string): string {
  // Get the current module's directory from import.meta.url
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Go up to the monorepo root: packages/tenant-deployer -> ../../ (root)
  // Then append services/ to access other services
  return path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'services',
    relativePath
  );
}
