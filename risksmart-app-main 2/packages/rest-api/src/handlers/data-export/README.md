# Microsoft SharePoint data export setup guide
Using Microsoft Graph REST API v1.0

This integration should ideally be set up by someone with experience with Microsoft SharePoint, Azure Entra and Microsoft Graph API.<br>
This is not a guide for risk managers but rather for IT professionals, with an understanding of the underlying concepts.


### Step 1: Prerequisites
Ensure the correct Graph and SharePoint permissions are set in Azure Entra and that the user doing this integration has correct access.<br>
The following steps are to be done by this user in order to ensure the correct permissions are granted.<br>
Your SysAdmin that manages MS AD should have set up an app specifically for this export, but it’s at their own discretion if they want to use an existing one.

Check `Entra dashboard / App registrations / {app name} / API permissions` has the following:
- Microsoft Graph
  - Files.ReadWrite.All
  - Sites.ReadWrite.All
  - User.Read
- SharePoint
  - Sites.ReadWrite.All
  - Sites.Selected

If any of the following steps fail then this is the first thing to check.

### Step 2: Getting the Bearer token
In order to progress we need a fresh Bearer token to use with the Microsoft Graph API.
Quickest way to get the correct one is to navigate to `https://myaccount.microsoft.com/?ref=MeControl`, open dev tools, go to the Network tab, and filter for `me` (you might have to refresh the page). This request will contain a fresh Bearer token in the Authorization header.

Make a note of this as we will need it for the next steps.

### Step 3: Getting the `siteId`
Using Postman(or similar) and the Bearer token from step 2 for the Authorization type.

Make a `GET` request using the following URL: `https://graph.microsoft.com/v1.0/sites/{{TenantName}}.sharepoint.com:/sites/{{SiteName}}` where `TenantName` e.g. `risksmart2022` and `SiteName` e.g. `RiskSmartCustomer`.
You can get these from the SharePoint URL .e.g `https://risksmart2022.sharepoint.com/sites/RiskSmartCustomer/Shared...`

The site id is the `id` field in the response and it follows the format: `{{TenantName}}.sharepoint.com,{{some-guid}},{{some-guid}}`.

Make a note of this as we will need it to set up the data export.

*Your configuration may vary, please refer to the Microsoft Graph API documentation for more details if this does not work for you.<br>
Reference Docs: https://learn.microsoft.com/en-us/graph/api/resources/sharepoint*

### Step 4: Getting the `driveId`
Similar to step 3, make a `GET` request using the following URL: `https://graph.microsoft.com/v1.0/sites/{{siteId}}/drives`<br>
This should return a list of drives, look for the one you want by `driveType` (e.g. `documentLibrary`) and `name` (e.g. `Documents`).<br>
The drive id is the `id` field.

Make a note of this as we will need it to set up the data export.

*Your configuration may vary, please refer to the Microsoft Graph API documentation for more details if this does not work for you.<br>
Reference Docs: https://learn.microsoft.com/en-us/graph/api/drive-list*

Where to find the various entra secrets and values required by the API:
- `SecretValue` and `SecretId` - Entra dashboard, in our application's Certificates & secrets tab
- `TenantId` - Entra dashboard, in our application's Overview tab, Essentials, Directory (tenant) ID
- `ClientId` - Entra dashboard, in our application's Overview tab, Essentials, Application (client) ID
- `sharePointSiteId` - synonymous with `siteId`(see above)
- `sharePointSiteId` - synonymous with `siteId`(see above)

### Step 5: Gathering all the values for the data export setup
- `Entra secret value` - Go to `Entra dashboard / App registrations / {app name} / Certificates & secrets`, create a new client secret and use the value
- `Entra tenant ID` - Go to `Entra dashboard / App registrations / {app name} / Overview` and use the `Directory (tenant) ID` (expand Essentials if not visible)
- `Entra client ID` - Go to `Entra dashboard / App registrations / {app name} / Overview` and use the `Application (client) ID` (expand Essentials if not visible)
- `SharePoint site ID` - Step 3
- `SharePoint drive ID` - Step 4
- `Folder` - Optional: if not provided it will export to the root of the drive (e.g. `Documents`) and the default folder is `Scheduled data export`. You can specify a single folder name which will be created at the root of the drive, or a path of folders (e.g. `Folder 1/Folder 2`) which will create Folder 1 at the root of the drive and Folder 2 inside Folder 1.

### Step 6: Testing the data export
Once you create a new schedule, a `Test saved configuration` button will appear in the top right of the Data Export Schedule execution register. This will instantly run the export using the saved configuration and show you the execution results.<br>
If the export fails, check the error message and troubleshoot accordingly. Common issues usually relate to permissions or secret expiry.
