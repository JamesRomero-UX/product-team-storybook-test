# Rest API

## Running

The rest API is run locally using [SST](https://sst.dev/).

SST will proxy requests via AWS, allowing the lambda function code to run locally, whilst still having access to your AWS infrastructure.

You can use the AWS Configuration Wizard generate a new config template from scratch or use the following AWS config template below:

**GENERATE A NEW CONFIG TEMPLATE**

To generate a new configuration run `aws configure sso` and enter the details found on the `Access Keys` section on the aws dashboard.
We will use the `Tech Admin` account for local dev.
Once setup, run `aws sso login --profile xxx` where xxx is the name of the profile setup with `aws configure sso`. If you're using the default profile, you won't need --profile.

Once logged in, run `AWS_PROFILE=xxx pnpm run sst:dev` where xxx in the profile name mentioned above. This command will deploy the rest api stack, and deploy any further stack changes as you save the file.

Once the infrastructure has been deployed you should see an ApiEndpoint logged out in the console.
Use this value to update the .env variable `REACT_APP_REST_API_URL` in the packages/web directory.

**EXAMPLE CONFIG TEMPLATE**
```
# ~/.aws/config

[profile dev]
sso_session = risk-smart
sso_account_id = <!-- account-number -->
sso_role_name = AWSAdministratorAccess
output = json

[profile tech-admin]
sso_session = risk-smart
sso_account_id = <!-- account-number -->
sso_role_name = AWSAdministratorAccess
output = json

[sso-session risk-smart]
sso_start_url = https://d-9c670bf43e.awsapps.com/start#
sso_region = eu-west-2
sso_registration_scopes = sso:account:access
```

To generate a new configuration run `aws configure sso` and enter the details found on the `Command line or programmatic access` link on the aws dashboard.
We will use the `Tech Admin` account for local dev.
Once setup, run `aws sso login --profile xxx` where xxx is the name of the profile setup with `aws configure sso`. If you're using the default profile, you won't need --profile.

Once logged in, run `AWS_PROFILE=xxx pnpm run sst:dev` where xxx in the profile name mentioned above. This command will deploy the rest api stack, and deploy any further stack changes as you save the file.

Once the infrastructure has been deployed you should see an ApiEndpoint logged out in the console.
Use this value to update the .env variable REACT_APP_REST_API_URL in the packages/web directory.

## Tests

```
pnpm dlx vitest
```
