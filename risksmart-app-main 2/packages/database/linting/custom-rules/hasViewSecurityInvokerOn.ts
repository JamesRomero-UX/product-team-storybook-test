import type { ViewDetails } from 'extract-pg-schema';
import { Rule } from 'schemalint';

export const hasViewSecurityInvokerOn: Rule = {
  name: 'has-view-security-invoker-on',
  docs: {
    description: 'Ensures security invoker is on for view',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = (view: ViewDetails) => {
      if (!view.options.securityInvoker) {
        report({
          rule: this.name,
          identifier: `${view.schemaName}.${view.name}`,
          message: `The view ${view.name} does not have the security invoker flag on. This is required for restricting view data for the reporting role`,
          suggestedMigration: `ALTER VIEW ${view.schemaName}.${view.name} SET (security_invoker = true);`,
        });
      }
    };
    console.log('Running');
    schemaObject.views.forEach(validator);
  },
};
