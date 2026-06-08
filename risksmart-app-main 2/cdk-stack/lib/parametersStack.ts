import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';

export class ParametersStack extends Stack {
  hasuraAdminSecret: secrets.Secret;

  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    stackProps: StackProps
  ) {
    super(scope, id, stackProps);

    // Moved to top level to share
    // // Without punctuation and spaces
    this.hasuraAdminSecret = new secrets.Secret(
      this,
      `${props.stage}-${props.appName}-HasuraAdminSecret`,
      {
        secretName: `${props.stage}-${props.appName}-HasuraAdminSecretV2`,
        generateSecretString: {
          excludePunctuation: true,
          excludeCharacters: ' "',
          includeSpace: false,
        },
      }
    );
  }
}
