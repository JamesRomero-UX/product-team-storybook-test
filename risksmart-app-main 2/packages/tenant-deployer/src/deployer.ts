/* eslint-disable no-console */
import { Toolkit } from '@aws-cdk/toolkit-lib';

import AppStack from '../bin/cdk-stack';

async function deploy() {
  try {
    // Create and configure the CDK Toolkit
    const toolkit = new Toolkit();

    // Create a cloud assembly source with an inline app
    const cloudAssemblySource = await toolkit.fromAssemblyBuilder(async () => {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      return await AppStack.synth();
    });

    // Deploy the stack
    const result = await toolkit.deploy(cloudAssemblySource);

    console.log('Deployment completed successfully');
    console.log('Result:', result);
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deploy()
  .then(() => {
    console.log('Deployment script completed successfully');
  })
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
