import type { StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { ComparisonOperator } from 'aws-cdk-lib/aws-cloudwatch';
import type { IHostedZone } from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';

export interface CertificatesTenantStackProps {
  hostedZone: IHostedZone;
}

export class CertificateTenantStack extends cdk.Stack {
  public readonly defaultCertificate: Certificate;

  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    certProps: CertificatesTenantStackProps,
    stackProps?: StackProps
  ) {
    super(scope, id, stackProps);

    this.defaultCertificate = new Certificate(
      this,
      `${props.stage}-${props.appName}-tenant-Certificate`,
      {
        domainName: certProps.hostedZone.zoneName,
        validation: CertificateValidation.fromDns(certProps.hostedZone),
      }
    );

    this.defaultCertificate
      .metricDaysToExpiry()
      .createAlarm(
        this,
        `${props.stage}-${props.appName}-tenant-CertificateExpiryAlarm`,
        {
          evaluationPeriods: 1,
          threshold: 45,
          comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        }
      );
  }
}
