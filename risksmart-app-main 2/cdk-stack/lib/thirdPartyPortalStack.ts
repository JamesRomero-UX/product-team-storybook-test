import type { StackProps } from 'aws-cdk-lib';
import { aws_s3, Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import type { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  CachePolicy,
  Distribution,
  HeadersReferrerPolicy,
  OriginRequestPolicy,
  PriceClass,
  ResponseHeadersPolicy,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import type { IHostedZone } from 'aws-cdk-lib/aws-route53';
import {
  AaaaRecord,
  ARecord,
  HostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';
import { getEnvSettings } from './env';

export interface ThirdPartyPortalProps extends LocalAppProps {
  externalHostedZoneId: string;
  externalZoneName: string;
  externalHostname: string;
  publicCert: Certificate;
}

export class ThirdPartyPortal extends Stack {
  cf: Distribution;

  constructor(
    scope: Construct,
    id: string,
    stackProps: StackProps,
    props: ThirdPartyPortalProps
  ) {
    super(scope, id, stackProps);

    const assetsBucket = new aws_s3.Bucket(this, `${props.stage}-tpp-bucket`, {
      bucketName: `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-risksmart-tpp-bucket`,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: aws_s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
    });

    let zone: IHostedZone;

    if (!props.riskSmartRegionProps.isRiskSmartRegion) {
      zone = HostedZone.fromLookup(
        this,
        `${props.stage}-${props.appName}-HostedZone`,
        {
          domainName: props.externalZoneName,
        }
      );
    } else {
      zone = HostedZone.fromHostedZoneAttributes(
        this,
        `${props.stage}-${props.appName}-HostedZone`,
        {
          hostedZoneId: props.externalHostedZoneId,
          zoneName: props.externalZoneName,
        }
      );
    }

    const productlaneSha =
      'sha256-ERGWR3ss3rQjKS+JsNFAAZ45KS2s6bnVwp0oyuQVSu8=';

    // Creating a custom response headers policy -- all parameters optional
    const responseHeadersPolicy = new ResponseHeadersPolicy(
      this,
      'TppResponseHeadersPolicy',
      {
        responseHeadersPolicyName: `${props.riskSmartRegionProps.regionStackNamePrefix}RiskSmartTppResponseHeadersPolicy`,
        comment: 'Base policy for RiskSmart Third Party Portal',
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            // See https://www.tiny.cloud/docs/tinymce/6/tinymce-and-csp/ to tiny policy
            contentSecurityPolicy: `default-src 'self'; worker-src 'self' blob: https://*.auth0.com https://*.segment.com https://*.google-analytics.com https://*.risksmart.link https://*.productlane.com; script-src 'self' 'unsafe-eval' https://browser.sentry-cdn.com https://cdn.segment.com https://www.googletagmanager.com https://*.productlane.com ${productlaneSha} *.tinymce.com *.tiny.cloud https://*.amplitude.com; style-src 'self' 'unsafe-inline' *.tinymce.com *.tiny.cloud *.productlane.com widget-main-app.pages.dev https://*.amplitude.com; object-src 'none'; base-uri 'self'; connect-src 'self' https://o4505232398745600.ingest.sentry.io https://o4505232398745600.ingest.us.sentry.io wss://api.knock.app https://*.knock.app https://*.auth0.com https://*.segment.com https://*.segment.io https://*.google-analytics.com https://*.risksmart.link wss://*.risksmart.link https://*.amazonaws.com https://*.productlane.com *.tinymce.com *.tiny.cloud blob: https://*.amplitude.com; font-src 'self' data:; frame-src 'self' blob: https://*.risksmart.link/ https://*.auth0.com/ https://*.productlane.com/; img-src 'self' data: *.tinymce.com *.tiny.cloud data: blob: https://*.amplitude.com; manifest-src 'self'; media-src 'self' https://*.amplitude.com;`,
            override: true,
          },
          contentTypeOptions: { override: true },
          referrerPolicy: {
            referrerPolicy: HeadersReferrerPolicy.NO_REFERRER,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.seconds(600),
            includeSubdomains: true,
            override: true,
          },
          xssProtection: { protection: true, modeBlock: true, override: true },
        },
        removeHeaders: ['Server'],
        serverTimingSamplingRate: 50,
      }
    );

    const envSettings = getEnvSettings(props.stage);

    // Create new CloudFront Distribution
    this.cf = new Distribution(this, `${props.stage}-tpp-cdnDistribution`, {
      enableLogging: false,
      domainNames: [props.externalHostname],
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(assetsBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: responseHeadersPolicy,
      },
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      certificate: props.publicCert,
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_100,
      webAclId: envSettings.thirdPartyPortalWebAclArn || undefined,

      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new ARecord(this, 'TppCRecord', {
      zone,
      recordName: props.externalHostname,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.cf)),
    });

    new AaaaRecord(this, 'TppAliasRecord', {
      zone,
      recordName: props.externalHostname,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.cf)),
    });
  }
}
