import type { IAspect } from 'aws-cdk-lib';
import { CfnResource, RemovalPolicy } from 'aws-cdk-lib';
import type { IConstruct } from 'constructs';

/**
 * Aspect to retain all resources in a stack
 */
export class RemovalPolicyRetainAspect implements IAspect {
  visit(node: IConstruct) {
    if (CfnResource.isCfnResource(node)) {
      node.applyRemovalPolicy(RemovalPolicy.RETAIN);
    }
  }
}
