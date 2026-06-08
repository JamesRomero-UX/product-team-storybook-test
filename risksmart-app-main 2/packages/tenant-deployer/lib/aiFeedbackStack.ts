/* eslint-disable no-console */
import type { StackProps } from 'aws-cdk-lib';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import {
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { CfnDeliveryStream } from 'aws-cdk-lib/aws-kinesisfirehose';
import type { IBucket } from 'aws-cdk-lib/aws-s3';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

import type { RiskSmartRegionProps } from '../bin/cdk-stack';
import type { EnvSettings, RisksmartStage } from './env';
import { getEnvSettings } from './env';

interface AiFeedbackStackProps {
  /**
   * Name of the Glue database containing the feedback table schema.
   * This should be created in global infrastructure (Tofu).
   */
  glueDatabaseName: string;
  /**
   * Name of the Glue table defining the Parquet schema.
   * This should be created in global infrastructure (Tofu).
   */
  glueTableName: string;
  /**
   * Optional: Use existing tenant bucket instead of creating new one
   */
  existingBucket?: IBucket;
}

/**
 * Stack that creates tenant-specific AI Feedback infrastructure:
 * - S3 bucket (or uses existing tenant bucket)
 * - Firehose delivery stream with Parquet conversion
 */
export class AiFeedbackStack extends Stack {
  public readonly feedbackBucket: IBucket;
  public readonly deliveryStreamName: string;

  constructor(
    scope: Construct,
    id: string,
    stage: RisksmartStage,
    appName: string,
    tenantName: string,
    stackProps: StackProps,
    riskSmartRegionProps: RiskSmartRegionProps,
    aiFeedbackProps: AiFeedbackStackProps,
    isLocal: boolean
  ) {
    super(scope, id, stackProps);

    const envSettings = getEnvSettings(stage, isLocal);
    const { glueDatabaseName, glueTableName, existingBucket } = aiFeedbackProps;

    // Use existing bucket or create new one for AI feedback
    this.feedbackBucket =
      existingBucket ??
      this.createFeedbackBucket(
        stage,
        appName,
        tenantName,
        riskSmartRegionProps.regionStackNamePrefix,
        envSettings
      );

    // Create Firehose delivery stream
    this.deliveryStreamName = this.createFeedbackFirehose(
      stage,
      appName,
      tenantName,
      riskSmartRegionProps.regionStackNamePrefix,
      glueDatabaseName,
      glueTableName
    );
  }

  private createFeedbackBucket(
    stage: RisksmartStage,
    appName: string,
    tenantName: string,
    regionStackNamePrefix: string,
    envSettings: EnvSettings
  ): IBucket {
    const bucket = new Bucket(this, 'AiFeedbackBucket', {
      bucketName:
        `${regionStackNamePrefix}${stage}-${appName}-${tenantName}-ai-feedback`.toLowerCase(),
      removalPolicy: envSettings.requestEventDynamoRemovalPolicy,
      autoDeleteObjects:
        envSettings.requestEventDynamoRemovalPolicy === RemovalPolicy.DESTROY,
    });

    console.log(
      `Created AI Feedback S3 bucket for tenant ${tenantName}: ${bucket.bucketName}`
    );

    return bucket;
  }

  private createFeedbackFirehose(
    stage: RisksmartStage,
    appName: string,
    tenantName: string,
    regionStackNamePrefix: string,
    glueDatabaseName: string,
    glueTableName: string
  ): string {
    const streamName = `${regionStackNamePrefix}${stage}-${appName}-${tenantName}-ai-feedback`;

    // IAM Role for Firehose
    const firehoseRole = new Role(this, 'FirehoseRole', {
      roleName: `${streamName}-firehose-role`,
      assumedBy: new ServicePrincipal('firehose.amazonaws.com'),
    });

    // Create a managed policy with all permissions
    // Using a separate Policy resource ensures CloudFormation creates proper dependencies
    const firehosePolicy = new Policy(this, 'FirehosePolicy', {
      policyName: `${streamName}-firehose-policy`,
      statements: [
        // S3 permissions - write to tenant bucket
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            's3:AbortMultipartUpload',
            's3:GetBucketLocation',
            's3:GetObject',
            's3:ListBucket',
            's3:ListBucketMultipartUploads',
            's3:PutObject',
          ],
          resources: [
            this.feedbackBucket.bucketArn,
            `${this.feedbackBucket.bucketArn}/*`,
          ],
        }),
        // Glue permissions - read schema for Parquet conversion
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'glue:GetDatabase',
            'glue:GetTable',
            'glue:GetTableVersion',
            'glue:GetTableVersions',
          ],
          resources: [
            `arn:aws:glue:${this.region}:${this.account}:catalog`,
            `arn:aws:glue:${this.region}:${this.account}:database/*`,
            `arn:aws:glue:${this.region}:${this.account}:table/*/*`,
          ],
        }),
        // Partition management permissions
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'glue:GetPartition',
            'glue:GetPartitions',
            'glue:CreatePartition',
            'glue:BatchCreatePartition',
            'glue:UpdatePartition',
            'glue:BatchUpdatePartition',
          ],
          resources: [
            `arn:aws:glue:${this.region}:${this.account}:catalog`,
            `arn:aws:glue:${this.region}:${this.account}:database/*`,
            `arn:aws:glue:${this.region}:${this.account}:table/*/*`,
          ],
        }),
        // CloudWatch Logs permissions (for error logging)
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
          resources: [
            `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/kinesisfirehose/${streamName}:*`,
          ],
        }),
      ],
    });

    // Attach policy to role
    firehosePolicy.attachToRole(firehoseRole);

    // Create Firehose Delivery Stream with Parquet conversion
    const deliveryStream = new CfnDeliveryStream(this, 'FeedbackStream', {
      deliveryStreamName: streamName,
      deliveryStreamType: 'DirectPut',
      extendedS3DestinationConfiguration: {
        bucketArn: this.feedbackBucket.bucketArn,
        roleArn: firehoseRole.roleArn,

        // S3 prefix with partitioning
        prefix:
          'ai-feedback/workstream=!{partitionKeyFromQuery:workstream}/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/',
        errorOutputPrefix:
          'ai-feedback-errors/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/!{firehose:error-output-type}/',

        // Buffering hints - larger for Parquet efficiency
        bufferingHints: {
          intervalInSeconds: 60,
          sizeInMBs: 64,
        },

        // Parquet conversion configuration
        dataFormatConversionConfiguration: {
          enabled: true,
          inputFormatConfiguration: {
            deserializer: {
              openXJsonSerDe: {},
            },
          },
          outputFormatConfiguration: {
            serializer: {
              parquetSerDe: {
                compression: 'SNAPPY',
              },
            },
          },
          schemaConfiguration: {
            catalogId: this.account,
            databaseName: glueDatabaseName,
            tableName: glueTableName,
            region: this.region,
            roleArn: firehoseRole.roleArn,
          },
        },

        // Dynamic partitioning to extract workstream from JSON
        dynamicPartitioningConfiguration: {
          enabled: true,
        },
        processingConfiguration: {
          enabled: true,
          processors: [
            {
              type: 'MetadataExtraction',
              parameters: [
                {
                  parameterName: 'MetadataExtractionQuery',
                  parameterValue: '{workstream: .workstream}',
                },
                {
                  parameterName: 'JsonParsingEngine',
                  parameterValue: 'JQ-1.6',
                },
              ],
            },
          ],
        },
      },
    });

    // Ensure IAM policy is fully created before Firehose attempts to validate permissions
    // This prevents race conditions where Firehose validates before IAM propagates
    deliveryStream.node.addDependency(firehosePolicy);

    console.log(
      `Created AI Feedback Firehose delivery stream for tenant ${tenantName}: ${streamName}`
    );

    return deliveryStream.deliveryStreamName ?? streamName;
  }
}
