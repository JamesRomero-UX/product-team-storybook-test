/* eslint-disable no-console */
import type { Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import type { FunctionProps } from 'aws-cdk-lib/aws-lambda';

import type { RiskSmartRegionProps } from '../../bin/cdk-stack';
import type { RisksmartStage } from '../env';

export type VpcFunctionSettings =
  | Pick<FunctionProps, 'vpc' | 'vpcSubnets' | 'securityGroups'>
  | undefined;

export const getVpcFunctionSettings = (
  stack: Stack,
  isLocal: boolean,
  stage: RisksmartStage,
  regionProps: RiskSmartRegionProps
): VpcFunctionSettings => {
  if (isLocal) {
    console.log('Running in local environment, skipping VPC configuration');

    return undefined;
  }

  if (!['app', 'prod', 'staging', 'dev-cloud'].includes(stage)) {
    console.warn(
      `Stage '${stage}' is not configured for VPC usage. ` +
        'Returning undefined for VPC settings.'
    );

    return undefined;
  }
  // Construct VPC, subnets, and security group using explicit IDs from regionProps
  const {
    id: vpcId,
    privateSubnetIds,
    publicSubnetIds,
    isolatedSubnetIds,
    vpcCidrBlock,
    availabilityZones,
  } = regionProps.vpc;

  if (
    !vpcId ||
    !privateSubnetIds.length ||
    !vpcCidrBlock ||
    !availabilityZones.length
  ) {
    throw new Error(
      `Missing VPC attributes in regionProps. ` +
        `vpcId: ${vpcId}, privateSubnetIds: ${privateSubnetIds.join(', ')}, vpcCidrBlock: ${vpcCidrBlock}, availabilityZones: ${availabilityZones.join(', ')}`
    );
  }

  const vpc = ec2.Vpc.fromVpcAttributes(stack, 'VPC', {
    vpcId,
    availabilityZones,
    privateSubnetIds:
      privateSubnetIds.length > 0 ? privateSubnetIds : undefined,
    publicSubnetIds: publicSubnetIds.length > 0 ? publicSubnetIds : undefined,
    isolatedSubnetIds:
      isolatedSubnetIds.length > 0 ? isolatedSubnetIds : undefined,
    vpcCidrBlock,
  });

  const noInboundAllOutboundSecurityGroup = new ec2.SecurityGroup(
    stack,
    'NoInboundAllOutboundSecurityGroup',
    {
      vpc,
      allowAllOutbound: true,
    }
  );

  return {
    vpc,
    vpcSubnets: {
      subnets: privateSubnetIds.map((subnetId) =>
        ec2.Subnet.fromSubnetId(stack, `Subnet-${subnetId}`, subnetId)
      ),
    },
    securityGroups: [noInboundAllOutboundSecurityGroup],
  };
};
