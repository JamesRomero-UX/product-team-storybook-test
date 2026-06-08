# Audit Account

This AWS account is created and managed by AWS Control Tower.

It's ideal to put in Security workloads that require read-only access to other AWS Accounts in our organisation.

While at the time of writing we are not managing our AWS Organisations with IaC, we should avoid making changes to anything handled by an SCP.
