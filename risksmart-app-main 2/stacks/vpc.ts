import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { FunctionProps } from 'aws-cdk-lib/aws-lambda';
import { Stack } from 'sst/constructs';

import { getResourcePrefix } from './regionalityResourceName';


import { isLocal } from './isLocal';

export type VpcFunctionSettings =
  | Pick<FunctionProps, 'vpc' | 'vpcSubnets' | 'securityGroups'>
  | undefined;

export const getFunctionVpcProps = (stack: Stack): VpcFunctionSettings => {
  if (isLocal(stack.stage)) {
    return undefined;
  }
  const resourcePrefix = getResourcePrefix(stack.stage);

  const vpcName = `${resourcePrefix}-tenant-VPC`;
  const sgName = `${resourcePrefix}-tenant-noInboundAllOutboundSecurityGroup`;
  const vpc = ec2.Vpc.fromLookup(stack, 'VPC', {
    vpcName,
  });

  return {
    vpc,
    vpcSubnets: {
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    },
    securityGroups: [
      ec2.SecurityGroup.fromLookupByName(
        stack,
        'FunctionSecurityGroup',
        sgName,
        vpc
      ),
    ],
  };
};
