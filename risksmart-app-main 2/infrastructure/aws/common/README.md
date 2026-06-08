# Using cfn_initial_setup.yaml

We execute this file to stand up the tofu s3 bucket and dynamodb lock table in a new AWS account or region.

It can be run with this command:

```shell
# Authenticate to AWS first
# Run this from the /infrastructure/aws/ folder

aws cloudformation deploy \
  --profile <your-profile-here> \
  --region <aws-region-here> \
  --stack-name <account-name-here>-<region-here>-terraform-setup-resources \
  --template-file common/cfn_initial_setup.yaml \
  --parameter-overrides \
    AccountName=<account-name-here> \
    AccountId=<account-id-here> \
    Region=<aws-region-here>
```
