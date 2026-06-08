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
import {
  AaaaRecord,
  ARecord,
  HostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';

export interface WebStackProps extends LocalAppProps {
  hostedZoneId?: string;
  hostedZoneName?: string;
  hostname?: string;
  externalHostedZoneId: string;
  externalZoneName: string;
  externalHostname: string;
  prefixKey?: string;
  cert?: Certificate;
  publicCert: Certificate;
}

export class WebStack extends Stack {
  cf: Distribution;

  constructor(
    scope: Construct,
    id: string,
    stackProps: StackProps,
    props: WebStackProps
  ) {
    super(scope, id, stackProps);

    const assetsBucket = new aws_s3.Bucket(
      this,
      `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-website-bucket`,
      {
        bucketName: `${props.riskSmartRegionProps.regionStackNamePrefix.toLowerCase()}${props.stage}-risksmart-website-bucket`,
        publicReadAccess: false,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        encryption: aws_s3.BucketEncryption.S3_MANAGED,
        versioned: true,
        blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      }
    );

    const zone = HostedZone.fromHostedZoneAttributes(
      this,
      `${props.stage}-fromHostedZoneAttributes`,
      {
        zoneName: props.externalZoneName,
        hostedZoneId: props.externalHostedZoneId,
      }
    );

    const productlaneSha =
      'sha256-ERGWR3ss3rQjKS+JsNFAAZ45KS2s6bnVwp0oyuQVSu8=';

    // Creating a custom response headers policy -- all parameters optional
    const responseHeadersPolicy = new ResponseHeadersPolicy(
      this,
      'ResponseHeadersPolicy',
      {
        responseHeadersPolicyName: `${props.riskSmartRegionProps.regionStackNamePrefix}RiskSmartResponseHeadersPolicy`,
        comment: 'Base policy for RiskSmart',
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            // See https://www.tiny.cloud/docs/tinymce/6/tinymce-and-csp/ to tiny policy
            contentSecurityPolicy: `default-src 'self'; worker-src 'self' blob: https://*.auth0.com https://*.segment.com https://*.google-analytics.com https://*.risksmart.link https://*.productlane.com; script-src 'self' 'unsafe-eval' https://browser.sentry-cdn.com https://cdn.segment.com https://www.googletagmanager.com https://*.productlane.com '${productlaneSha}' *.tinymce.com *.tiny.cloud https://*.amplitude.com; style-src 'self' 'unsafe-inline' *.tinymce.com *.tiny.cloud *.productlane.com widget-main-app.pages.dev https://*.amplitude.com; object-src 'none'; base-uri 'self'; connect-src 'self' https://o4505232398745600.ingest.sentry.io wss://api.knock.app https://*.knock.app https://*.auth0.com https://*.segment.com https://*.segment.io https://*.google-analytics.com https://*.risksmart.link https://*.productlane.com wss://*.risksmart.link https://*.amazonaws.com *.tinymce.com *.tiny.cloud blob: https://*.amplitude.com; font-src 'self' data:; frame-src 'self' blob: https://*.risksmart.link/ https://*.auth0.com/ https://*.productlane.com/; img-src 'self' data: *.tinymce.com *.tiny.cloud data: blob: https://*.amplitude.com; manifest-src 'self'; media-src 'self' https://*.amplitude.com;`,
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

    // Create new CloudFront Distribution
    this.cf = new Distribution(this, `${props.stage}-cdnDistribution`, {
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

    new ARecord(this, 'CDNARecord', {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.cf)),
    });

    new AaaaRecord(this, 'AliasRecord', {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.cf)),
    });
  }
}
