# Third Party

## Overview

Elaborate on these:
- Third Party Portal
- Third Party Register
- Third Party Templates (uses Questionnaire Templates)
- Third Party Responses (uses Questionnaire Responses)
- Questionnaire Builder (uses the [Form Builder](./form-builder.md) Component)

## Go to → [Third Party](../packages/web/src/pages/third-party)

## Notes
- Some great notes should definitely go here

## An example user journey
- Login to the web portal as RiskManager1
- Navigate to Third Party -> Templates
- Create a Questionnaire Template (if one doesn't already exist)
- Navigate to Versions tab at the top of the Questionnaire Template form
- Add a new version
- Add one or more sections and one or more questions in each section then Save (ensure some are required and some are not)
- Navigate back to the template you just created and 'Publish' it
- Navigate to Third Party -> Register
- Add Third Party if one doesn't already exist
- Navigate to Questionnaires tab at the top of the form
- Plan Questionnaire
- Enter supplier1@user.com in the users section of the form (REMEMBER TO PRESS ENTER)
- Select your newly published questionnaire and then press 'Save'
- THIS STEP IS CURRENTLY A HACK: Head to the hasura console and in the data tab look up the questionnaire_invite table. Edit the UserId of your newly created invite and paste the following user id into the field auth0|6707ec212c4ec21f3de97b44 AND set the ModifiedAtTimestamp to Default
- Login to the Third Party Portal as Supplier1 (login: supplier1@user.com, password: Password123!)
- Ensure the new questionnaire response starts with a status of Not started
- Fill out the questionnaire
- Check that you CAN partially fill out the form (leaving one or more required fields empty) and successfully Save for later without triggering form validation
- Ensure the new questionnaire response now has a status of In progress
- Check that you CANNOT Submit the form without filling out all required fields and that you CAN successfully Submit the form once all required fields have been filled out correctly
- Ensure the new questionnaire response now has a status of Completed
- Head back to the web portal as RiskManager1
- Navigate to Third Party -> Responses
- Check the status of the questionnaire you've submitted as Supplier1 is correct (Completed)
