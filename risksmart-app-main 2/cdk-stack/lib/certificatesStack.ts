import type { StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { ComparisonOperator } from 'aws-cdk-lib/aws-cloudwatch';
import type { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';

export interface CertificatesStackProps extends LocalAppProps {
  hostedZoneId: string;
  hostedZoneName: string;
  hostname: string;
  prefixKey: string;
  lookupByName?: boolean;
}

export interface CertificatesOutputs {
  certificate: Certificate;
}

export class CertificatesStack extends cdk.Stack {
  public readonly certificates: CertificatesOutputs;

  constructor(
    scope: Construct,
    id: string,
    props: CertificatesStackProps,
    stackProps?: StackProps
  ) {
    super(scope, id, stackProps);

    let hostedZone: IHostedZone;

    if (props.lookupByName && !props.riskSmartRegionProps.isRiskSmartRegion) {
      hostedZone = PublicHostedZone.fromLookup(
        this,
        `${props.stage}-${props.appName}-HostedZone`,
        {
          domainName: props.hostedZoneName,
        }
      );
    } else {
      hostedZone = PublicHostedZone.fromHostedZoneAttributes(
        this,
        `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-${props.appName}-HostedZone`,
        {
          hostedZoneId: props.hostedZoneId,
          zoneName: props.hostedZoneName,
        }
      );
    }

    const certificate = new Certificate(
      this,
      `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-${props.appName}-Certificate`,
      {
        domainName: props.hostname,
        validation: CertificateValidation.fromDns(hostedZone),
      }
    );

    certificate
      .metricDaysToExpiry()
      .createAlarm(
        this,
        `${props.stage}-${props.appName}-${props.prefixKey}CertificateExpiryAlarm`,
        {
          evaluationPeriods: 1,
          threshold: 45,
          comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
        }
      );

    this.certificates = {
      certificate,
    };
  }
}
