# Third Party Portal

When we send a questionnaire to a third party they will access and resolve that questionary using the third part portal.

### Running locally

1. Create `.env` file using `.env.example` as a starting point and add the correct variables.
The values for the following variables are in the Auth0 console. Make sure you are in the `dev-` tenant, not `dev-cloud-`:
```
REACT_APP_AUTH0_DOMAIN={{tenant name starting with "dev-"}}.uk.auth0.com
REACT_APP_AUTH0_CLIENT_ID={{Applications tab / Third Party Portal Client ID}}
REACT_APP_AUTH0_CONNECTION_NAME=Username-Password-ThirdParty
```

2. Set the following variables in the root `.env`:
```
AUTH0_DOMAIN={{tenant name starting with "dev-"}}.uk.auth0.com
AUTH0_MANAGEMENT_CLIENT_ID={{Applications tab / RiskSmart Rest API Client ID}}
AUTH0_THIRD_PARTY_CONNECTION_NAME=Username-Password-ThirdParty
AUTH0_THIRD_PARTY_CLIENT_ID={{Applications tab / Third Party Portal Client ID}}
```

3. Start the local app(api-stack, sst and FE) then from the root of the project run `pnpm run start-tpp`

4. Once everything is running head over to the app Third Party tab for the following steps:
- Add a third party in the Register tab
- In the Questionnaires tab, add a questionnaire, create a version and publish it
- In the Register, select the third party that you created, go to the questionnaire tab and plan a questionnaire using an email address that is NOT associated with Risksmart
- Troubleshooting: After sending the questionnaire, keep an eye on the terminal where SST is running for errors
  - The submit handler will attempt to create a user with the email you provided in Auth0, so if the environment variables are not correct the handler will throw
  - Locally, you will not get an email when sending a questionnaire because the notifications are not set up properly
  If you get `Execution of an Action failed`, investigate the error logs and identify the action name e.g. `"action_name": "Add M2M Claims"`.
  The Auth0 Actions are not deployed locally, but updated manually in the Auth0 console so they can fall out of sync with the other environments.
  If you get an error regarding one of these actions go to the dev Auth0 console, Actions tab / Library, select your action, copy/paste the code from the same action in the dev-cloud tenant into the local action and redeploy it.
  - Check the `questionnaire_invite` entry and make sure the `UserId` matheches the Auth0 User Id associated with the email

5. Before logging into the third party portal we need to make some changes to the newly created user in dev tenant Auth0 console:
  - Go to the Organizations tab, select the organization you sent the questionnaire from, go to the Members tab and add the newly created user as a member
  - Go to the User Management / Users tab, search for the newly created user, go to the bottom of the Details tab and Change Password to something new that you will use to log into the third party portal with

6. Now you can log into the third party portal using the email and password you set in the previous step

