# RiskSmart Notifications

This document explains the different notifications sent by the RiskSmart application.

## Actions

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Action Inserted** | Notifies users when a new action is created. | A new action is created. | - | Users subscribed to the action. | In-App, Slack, Email |
| **Action Updated** | Notifies users when an action is updated. | An action is updated. | - | Users subscribed to the action. | In-App, Slack, Email |
| **Action Deleted** | Notifies users when an action is deleted. | An action is deleted. | - | Users subscribed to the action. | In-App, Slack, Email |
| **Action Due** | Notifies users when an action is due. | An hourly poller identifies actions that are due. | Reminders are sent 1, 2, 3, 7, 14, 21, and 30 days before the due date. | Assignee of the action. | In-App, Slack, Email |
| **Action Overdue** | Notifies users when an action is overdue. | An hourly poller identifies actions that are overdue. | Reminders are sent 1, 2, 7, and 30 days after the due date. | Assignee of the action. | In-App, Slack, Email |

## Attestations

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Attestation Required** | Notifies users that they need to provide an attestation for a document. | A new attestation record is created for a user. | - | The user who needs to provide the attestation. | In-App, Slack, Email |
| **Attestation Reminder** | Sends a reminder to users who have not yet completed their required attestations. | An hourly poller identifies pending attestations. | Reminders are sent when 50% of the attestation period has passed, and 1, 2, and 3 days before the expiration date. | The user who needs to provide the attestation. | In-App, Slack, Email |

## Change Requests

| Notification | Description | Trigger | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- |
| **Change Request Submitted** | Notifies users when a new change request is submitted for approval. | A new change request is submitted. | Approvers of the change request. | Email, In-App, Slack |
| **Change Request Rejected** | Notifies the creator of a change request that their request has been rejected. | A change request is rejected. | The user who created the change request. | Email, In-App, Slack |

## Controls

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Control Inserted** | Notifies users when a new control is created. | A new control is created. | - | Users subscribed to the control. | In-App, Slack, Email |
| **Control Updated** | Notifies users when a control is updated. | A control is updated. | - | Users subscribed to the control. | In-App, Slack, Email |
| **Control Deleted** | Notifies users when a control is deleted. | A control is deleted. | - | Users subscribed to the control. | In-App, Slack, Email |
| **Control Test Due** | Notifies users when a control test is due. | An hourly poller identifies control tests that are due. | A notification is sent on the due date, and also the day before it is overdue. | Assignee of the control test. | In-App, Slack, Email |
| **Control Test Overdue** | Notifies users when a control test is overdue. | An hourly poller identifies control tests that are overdue. | A notification is sent as soon as the control test becomes overdue. | Assignee of the control test. | In-App, Slack, Email |

## Documents

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Document Inserted** | Notifies users when a new document is created. | A new document is created. | - | Users subscribed to the document. | In-App, Slack, Email |
| **Document Updated** | Notifies users when a document is updated. | A document is updated. | - | Users subscribed to the document. | In-App, Slack, Email |
| **Document Deleted** | Notifies users when a document is deleted. | A document is deleted. | - | Users subscribed to the document. | In-App, Slack, Email |
| **Document Due** | Notifies users when a document is due for review. | An hourly poller identifies documents that are due for review. | A notification is sent on the due date. | Owner of the document. | In-App, Slack, Email |
| **Document Overdue** | Notifies users when a document is overdue for review. | An hourly poller identifies documents that are overdue for review. | A notification is sent as soon as the document becomes overdue. | Owner of the document. | In-App, Slack, Email |

## Indicators

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Indicator Due** | Notifies users when an indicator is due. | An hourly poller identifies indicators that are due. | A notification is sent on the due date, and also the day before it becomes overdue. | Assignee of the indicator. | In-App, Slack, Email |
| **Indicator Overdue** | Notifies users when an indicator is overdue. | An hourly poller identifies indicators that are overdue. | A notification is sent as soon as the indicator becomes overdue. | Assignee of the indicator. | In-App, Slack, Email |

## Issues

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Issue Inserted** | Notifies users when a new issue is created. | A new issue is created. | - | Users subscribed to the issue. | In-App, Slack, Email |
| **Issue Updated** | Notifies users when an issue is updated. | An issue is updated. | - | Users subscribed to the issue. | In-App, Slack, Email |
| **Issue Deleted** | Notifies users when an issue is deleted. | An issue is deleted. | - | Users subscribed to the issue. | In-App, Slack, Email |
| **Issue Due** | Notifies users when an issue is due. | An hourly poller identifies issues that are due. | A notification is sent on the due date. | Assignee of the issue. | In-App, Slack, Email |
| **Issue Overdue** | Notifies users when an issue is overdue. | An hourly poller identifies issues that are overdue. | A notification is sent as soon as the issue becomes overdue. | Assignee of the issue. | In-App, Slack, Email |

## Policies

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Policy Approver** | Notifies users that a new policy document version is ready for their review and approval. | A new version of a policy document is submitted for approval. | - | The designated approvers for the policy document. | Email, In-App, Slack |
| **Policy Document Version Review Due** | Notifies users that a policy document version is due for review. | An hourly poller identifies policy document versions that are due for review. | A notification is sent on the due date. | The owner of the policy document. | In-App, Email, Slack |
| **Policy Document Version Review Upcoming** | Notifies users that a policy document version will soon be due for review. | An hourly poller identifies policy document versions that are approaching their review date. | A notification is sent 30 days before the review date. | The owner of the policy document. | In-App, Email, Slack |

## Risks

| Notification | Description | Trigger | Schedule | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Risk Inserted** | Notifies users when a new risk is created. | A new risk is created. | - | Users subscribed to the risk. | In-App, Slack, Email |
| **Risk Updated** | Notifies users when a risk is updated. | A risk is updated. | - | Users subscribed to the risk. | In-App, Slack, Email |
| **Risk Deleted** | Notifies users when a risk is deleted. | A risk is deleted. | - | Users subscribed to the risk. | In-App, Slack, Email |
| **Risk Assessment Due** | Notifies users when a risk assessment is due. | An hourly poller identifies risk assessments that are due. | A notification is sent on the due date, and also the day before it becomes overdue. | Assignee of the risk assessment. | In-App, Slack, Email |
| **Risk Assessment Overdue** | Notifies users when a risk assessment is overdue. | An hourly poller identifies risk assessments that are overdue. | A notification is sent as soon as the risk assessment becomes overdue. | Assignee of the risk assessment. | In-App, Slack, Email |

## Third-Party

| Notification | Description | Trigger | Recipients | Channels |
| :--- | :--- | :--- | :--- | :--- |
| **New Questionnaire** | Notifies a third-party contact that a new questionnaire is available for them to complete. | A new questionnaire is sent to a third-party. | The third-party contact. | Email |
| **Password Reset** | Sends a password reset link to a third-party contact. | A third-party contact requests a password reset. | The third-party contact. | Email |
| **Questionnaire Recalled** | Notifies a third-party contact that a questionnaire has been recalled. | A questionnaire is recalled by a RiskSmart user. | The third-party contact. | Email |
| **Response Submitted** | Notifies internal users that a third-party has submitted a response to a questionnaire. | A third-party submits a response to a questionnaire. | Internal users subscribed to the third-party. | In-App, Slack, Email |
| **Response Status Updated** | Notifies a third-party contact that the status of their submitted response has been updated. | The status of a third-party's response is updated by a RiskSmart user. | The third-party contact. | Email |
