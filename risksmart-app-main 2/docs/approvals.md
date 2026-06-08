# Approvals

Documentation detailing how to create/update approval workflows and anything you need to be aware of.

## Contents

- [Workflows](#workflows)
  - [Configuration](#configuration)
  - [Creating a new workflow](#creating-a-new-workflow)
    - [1. Add the workflow to the shared repository](#1-add-the-workflow-to-the-shared-repository)
    - [2. Add the workflow configuration to the rest-api](#2-add-the-workflow-configuration-to-the-rest-api)
    - [3. Create the `post.ts` function for the update action endpoint.](#3-create-the-postts-function-for-the-update-action-endpoint)
    - [4. Add the workflow to the frontend form.](#4-add-the-workflow-to-the-frontend-form)
    - [5. Well done](#5-well-done)
  - [Bulk Workflow Executions](#bulk-workflow-executions)

## Workflows

Workflow IDs are defined in the `shared` repository, in this file [/packages/shared/src/approvals/workflows.ts](../packages/shared/src/approvals/workflows.ts).

The contents of the workflows file contains the mapping for each workflow, and which parent type they are **_configured_** from.

```ts
export const workflows = {
  document: ['publish-document-version'],
  risk: ['open-acceptance', 'delete-risk', 'delete-acceptance'],
  control: ['delete-control'],
  issue: ['delete-issue'],
};
```

> A workflow doesn't have to necessarily be configured from the object it is approving, for example, the `delete-acceptance` workflow above is configured on the `risk` object, but it is approving the `acceptance` object.

### Configuration

The configuration for the behaviour of each workflow is defined in the `rest-api` repository, in the [/packages/rest-api/src/approval-workflows/workflows.ts](../packages/rest-api/src/approval-workflows/workflows.ts)

When you add a new workflow the the `shared` repository, you have to add a configuration for it in the `rest-api` otherwise you will get type errors.

A workflow configuration is created using the `requireApprovalService` function. Below is an example of a "publish-document-version" configuration.

```ts
export default requireApprovalService(
  // workflow name
  'publish-document-version',

  // The type of approval ('update' or 'delete')
  'update',

  // The 3rd argument is the function that will be called when the approval is approved/executed.
  // This usually should run in the context of an admin user, so that it can always be merged successfully without permission issues.
  // IMPORTANT: The arguments for this function can be whatever you like, however, they MUST be serializable to JSON since they are stored in each change request.
  (tenant) => async (id: string, orgKey: string, userId: string, data: DocumentFileSetInput) => {
      const service = DocumentVersionService(...)
      return service.update(id, userId, data);
  },

  // The 4th argument is the workflow configuration settings, this contains mapping functions for the approval process.
  // The mapping functions take the same parameters as the approval function.
  {
    // The ID of the object from where the approval is configured from
    approvalParentId: (tenant) => async ({id, orgKey}) => {
      const service = DocumentVersionService(...);
      return (await service.findById(id)).ParentDocumentId;
    },

    // The approvalCheck function is used to determine if the workflow should cause an approval request to be created. Sometimes you may want to
    // create an approval request only if a certain condition is met. In this example, we only want to create an approval request if the status is changed
    // to published.
    approvalCheck: (tenant) => async (id, orgKey, _, data) => {
      const service = DocumentVersionService(...);
      const current = await service.findById(id);
      return (
        current.Status !== data.Status &&
        data.Status === VersionStatusEnum.Published
      );
    },
  }
);
```

### Creating a new workflow

#### 1. Add the workflow to the shared repository

To create a new workflow, you need to add a new entry to the `workflows` object in the `shared` repository.

```ts
// /packages/shared/src/approvals/workflows.ts.

export const workflows = {
  // other workflows here

  action: ['close-action'],
};
```

Here we will create a workflow that can be configured on an `action`, the workflow is called `action-close` and it will require an approval when someone wants to close an action.

#### 2. Add the workflow configuration to the rest-api

Next, you need to create a configuration for this workflow in the `rest-api` repository.

```ts
// /packages/rest-api/src/approval-workflows/close-action.workflow.ts.

export default requireApprovalService(
  'close-action',
  'update',

  // update action function
  (tenant) =>
    async (
      id: string,
      orgKey: string,
      userId: string,
      data: ActionSetInput
    ) => {
      // update action with a the user ID, but in the context of an admin user
      const service = ActionService({
        tenant,
        orgKey,
        userId,
        userRole: ADMIN_ROLE,
      });
      return service.update(id, userId, data);
    },
  {
    approvalParentId:
      () =>
      async ({ id }) =>
        id,
    approvalCheck:
      (tenant) =>
      async ({ id, orgKey, data }) => {
        // get the current action and check if the status has changed to close.
        const service = ActionService({
          tenant,
          orgKey,
          userId: SYSTEM_USER,
          userRole: ADMIN_ROLE,
        });
        const current = await service.findById(id);
        return (
          current.Status !== data.Status &&
          data.Status === ActionStatusEnum.Closed
        );
      },
  }
);
```

#### 3. Create the `post.ts` function for the update action endpoint.

Finally, you need to call the workflow in the PUT endpoint that updates the action.

```ts
// actions/put.ts

export const handler = backendApiHandler(PostSchema, async (request) => {
  // IMPORTANT: make sure you use the checkPermission function because the workflow runs in
  // the context of an admin!!
  await checkPermission(
    request,
    ParentTypeEnum.Action,
    AccessTypeEnum.Update,
    request.input.Id
  );

  const { Id, ...payload } = request.input;

  // Run the workflow using the `.execute` function.
  await workflows['close-action'](request.tenant).execute(request)(
    Id,
    request.session_variables['x-hasura-org-id'],
    request.session_variables['x-hasura-user-id'],
    payload
  );

  // This code below is ran in the case of a successful response.
  // A successful response means either the workflow ran successfully without requiring an approval
  // OR a change request was confirmed created.
  return {
    statusCode: 200,
    body: JSON.stringify({ affected_rows: 1 }),
  };
});
```

> **IMPORTANT:** make sure you use the checkPermission function because the workflow runs in the context of an admin!!

> **IMPORTANT:** ensure that the corresponding Hasura action has got the `forward_client_headers` set to `true` in the `actions.yaml` file.

#### 4. Add the workflow to the frontend form.

To make the form aware that this form supports change requests, you just need to add the `approvalConfig` prop to the `FormContext` component.
This accepts a `object` that refers to the object that the approval is performed on. (e.g. the action). It just requires an object with the shape `{Id: string}`

```tsx
// actions/form.ts
<FormContext
  {...props}
  approvalConfig={{ object: { Id: action.Id }}}
>
```

#### 5. Well done

It should work now. Remember to do some final cleanup steps as well.

- Make sure the update_action endpoint is set to backend_only
- Ensure the unit tests are updated for action update to handle the new API responses
- In the case of an `update` request, make sure the form mappings work for every field in the form. Not just the fields that are required for the approval, because an `update` request can be amended to include any form fields.

### Bulk Workflow Executions

Some endpoints may require bulk workflow executions (e.g. bulk deletions). In this case, you can use the `executeBulkDryRun` function in place of the `execute` function.

```ts
const requests = [...]

const results = await workflows['close-action'](request.tenant).execute(request)(
    requests.map((request) => [
      request.input.Id,
      request.session_variables['x-hasura-org-id'],
      request.session_variables['x-hasura-user-id'],
      request.input.payload,
    ])
  );
```

This will return an array of results for each request. It will not do anything (hence dry run).

The results are an array of objects with the shape:

```ts
type WorkflowResult =
  | {
      result: 'success';
      data: Parameters<T>;
    }
  | {
      result: 'change-request-required';
      data: {
        data: CreateChangeRequestInput;
        type: WorkflowType;
        config: RequireApprovalConfig;
        forceApprovalProcess: boolean;
      };
    }
  | {
      result: 'amend-change-request';
      data: {
        changeRequest: ChangeRequestForBackendPartsFragment;
        userId: string;
        changes: unknown[];
        approvalConfig: RequireApprovalConfig;
      };
    };
```

There are 3 outcomes

- `success` - The workflow passed and you should proceed with the request
- `change-request-required` - A change request should be created. The variables for the change request are supplied.
- `amend-change-request` - A change request should be amended. The variables for the change request are supplied.

You need to handle these events manually after the dry run. This is so that you can combine them into single INSERT queries. You can look at other workflows (e.g. delete-control) for an example of this implementation.
