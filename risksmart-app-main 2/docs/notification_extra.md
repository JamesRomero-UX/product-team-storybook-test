# RiskSmart Notification System Overview (for Customer Success)

## Table of Contents

1. **Introduction**
    * Purpose of the notification system within RiskSmart.
    * Brief overview of the flow: Event Trigger -> Data Gathering -> Knock Interaction -> User Notification.

    The primary purpose of the RiskSmart notification system is to proactively inform users about relevant events, updates, and required actions within the platform. This ensures timely awareness and engagement, helping users stay on top of their responsibilities and important changes related to the risks, controls, issues, or other objects they manage or are involved with.

    At a high level, the notification process follows these steps:
    1. **Event Trigger:** An action occurs within RiskSmart (e.g., an issue is assigned, a comment is added, a due date approaches). These are data events that can happen in the system due data changes or user interactions.
    2. **Data Gathering:** The system identifies the key details of the event (what happened, who initiated it) and determines who should be notified based on roles, ownership, and contributions.
    3. **Knock Interaction:** The gathered information is securely passed to our notification partner, Knock.
    4. **User Notification:** Knock processes the information using predefined workflows and considering individual user preferences, then delivers the notification through the appropriate channels (like in-app messages or email).

2. **Feature Control: Enabling/Disabling Notifications**
    * How notifications are managed at the organizational level.
    * Explanation of the `notifications` feature flag in Organization Metadata.
    * How to check if notifications are enabled for an organization.

    Notifications can be enabled or disabled for an entire customer organization. This provides a feature switch to control whether any notifications are sent out for that specific organization.

    This control is managed via a feature flag stored within the Organization's metadata. The specific flag is named `notifications`.
    * If `notifications: true` (or the flag is absent, as `true` is the default), the notification system is active for the organization.
    * If `notifications: false`, the notification system is completely disabled for that organization, and no notifications will be triggered or sent via Knock.

    To check the status for an organization, you would typically need to query the Organization's metadata, often accessible through internal admin tools or by querying the relevant database table where organization settings are stored.

3. **Idempotency: Preventing Duplicate Notifications**
    * What idempotency means in this context and why it's crucial.
    * The mechanism used (DynamoDB check before sending).
    * How unique idempotency keys are generated for each potential notification event.

    Idempotency ensures that performing the same operation multiple times produces the same result as performing it once. In the context of notifications, this is critical to prevent sending duplicate messages to users if the same event trigger is processed more than once (e.g., due to system retries or concurrent processing).

    To achieve idempotency, RiskSmart employs the following mechanism:
    1. **Generate a Unique Key:** Before attempting to send any notification, a unique idempotency key is constructed based on the specific event details (like the event type, the object ID, relevant timestamps, and potentially the recipient ID if the check is per-user).
    2. **Check DynamoDB:** This key is used to check a dedicated DynamoDB table. If an entry with this key already exists, it means this specific notification event has already been processed (or is currently being processed).
    3. **Conditional Send:** The notification is only sent to Knock if the idempotency key does *not* exist in the DynamoDB table. If the key is absent, an entry is created in the table *before* sending the notification to Knock, marking it as processed.

    This DynamoDB check acts as a lock, ensuring that even if the notification trigger logic runs multiple times for the exact same event, the actual notification is dispatched only once.

4. **Building the Notification: Gathering Data and Recipients**
    * Identifying the "Actor" (who initiated the event, or system).
    * How the system determines who should receive a notification:
        * Direct Owners (Users).
        * Direct Contributors (Users).
        * Owner Groups.
        * Contributor Groups.
        * Inherited/Ancestor Contributors (Users & Groups).
        * Associated Objects/Departments (for context/targeting).
    * Process of deduplicating recipients.
    * Assembling the core data payload for the notification:
        * Essential details (Object ID, Title, Timestamp, Sequence ID, Org Name).
        * Context-specific information (e.g., Issue Type, Due Dates).
        * Parent object details (if relevant).

    Before a notification can be sent, the system needs to gather all necessary information, including who performed the action and who needs to be informed.

    **Identifying the Actor:**
    The "Actor" is the entity responsible for the event triggering the notification. This is typically the user who made a change (e.g., assigned an issue, added a comment). In some cases, the actor might be the system itself (e.g., for automated reminders about due dates).

    **Determining Recipients:**
    Identifying the correct recipients is crucial. The system uses the context of the event and the relationships defined in RiskSmart to build the recipient list. This involves looking up:
    * **Direct Owners (Users):** Users explicitly assigned as owners of the affected object (e.g., the owner of a Risk).
    * **Direct Contributors (Users):** Users explicitly assigned as contributors to the affected object.
    * **Owner Groups:** Users who are members of a Group assigned as an owner.
    * **Contributor Groups:** Users who are members of a Group assigned as a contributor.
    * **Inherited/Ancestor Contributors (Users & Groups):** For objects in a hierarchy (like Controls under a Risk), users or groups who are contributors to parent/ancestor objects might also be notified, depending on the notification type and configuration.
    * **Associated Objects/Departments:** Sometimes, users linked via related objects or departments might be included for broader context or awareness.

    **Deduplication:**
    A user might be identified as a recipient through multiple paths (e.g., being a direct owner *and* a member of a contributor group). The system automatically deduplicates the final list to ensure each user receives only one notification per event.

    **Assembling the Data Payload:**
    The core information about the event is packaged into a data payload. This payload is sent to Knock and used to populate the notification content (email subject/body, in-app message). Key elements include:
    * **Essential Details:** Unique ID of the affected object, its title or name, the timestamp of the event, a unique sequence ID for the object (if applicable), and the Organization's name.
    * **Context-Specific Information:** Details relevant to the event type, such as the type of Issue, upcoming due dates, the content of a comment, or the previous/new status.
    * **Parent Object Details:** If the affected object is part of a hierarchy (e.g., a Control Test under a Control), information about the parent object (like its ID and title) might be included for better context.

5. **Interaction with Knock (Third-Party Service)**
    * Knock's role: Managing workflow logic, delivery channels (email, in-app), and user preferences.
    * How RiskSmart triggers specific Knock workflows.
    * Key information passed from RiskSmart to Knock (Workflow Key, Actor, Recipients, Data Payload, Tenant ID, Idempotency Key).
    * Mention that user-specific delivery preferences (e.g., turn off email for certain types) are managed within Knock's interface.

    RiskSmart partners with a third-party service called **Knock** to handle the complexities of notification delivery, workflow management, and user preferences.

    **Knock's Role:**
    * **Workflow Engine:** Knock allows defining notification workflows (e.g., "Issue Assigned," "Comment Added"). These workflows dictate the notification content, timing, and delivery channels.
    * **Delivery Channel Management:** Knock manages sending notifications via different channels, primarily In-App messages within RiskSmart and Email.
    * **User Preferences:** Knock provides infrastructure for users to manage their notification preferences (e.g., opting out of certain email notifications while still receiving them in-app). *Note: While Knock supports this, the user interface for managing these preferences might be exposed through RiskSmart or directly in Knock, depending on the implementation.*

    **Triggering Knock Workflows:**
    When a notifiable event occurs and the data/recipients are gathered (as described in Section 4), RiskSmart makes a secure API call to Knock to trigger a specific, predefined workflow.

    **Information Sent to Knock:**
    The key information passed from RiskSmart to Knock includes:
    * **Workflow Key:** A unique identifier telling Knock which specific workflow to execute (e.g., `issue-assigned`, `comment-on-risk`).
    * **Actor:** The ID of the user or system entity that initiated the event.
    * **Recipients:** The list of deduplicated User IDs who should potentially receive the notification.
    * **Data Payload:** The structured data containing all the contextual information about the event (object details, specific changes, etc.) needed to populate the notification templates within Knock.
    * **Tenant ID:** The unique identifier for the customer organization (often the Organization ID) to ensure data segregation and proper targeting within Knock.
    * **Idempotency Key:** The unique key (discussed in Section 3) that Knock uses to prevent processing the same trigger request multiple times.

    **User Delivery Preferences:**
    It's important to understand that while RiskSmart determines *who* is eligible to receive a notification based on roles and relationships, the final delivery (and the specific channel used) is subject to user-specific preferences configured within the Knock system. A user might choose to disable email notifications for certain event types, even if RiskSmart identifies them as a recipient for that event.

   ## Notification Types

   ### Scheduled Notifications (DETAIL_TYPES)

    These notifications are triggered based on scheduled events or deadlines:

    * **IssueDue:** An issue is due.
    * **IssueOverdue:** An issue is overdue.
    * **ActionDue:** An action is due.
    * **ActionOverdue:** An action is overdue.
    * **ScheduleDue:** A scheduled task (e.g., Control Test, Risk Assessment, Indicator, Document Review) is due.
    * **ScheduleOverdue:** A scheduled task (e.g., Control Test, Risk Assessment, Indicator, Document Review) is overdue.
    * **PolicyAttestationReminder:** Reminder for policy attestation.
    * **PolicyDocumentVersionReviewDue:** A policy document version review is due.
    * **PolicyDocumentVersionReviewUpcoming:** A policy document version review is upcoming.

   ### Data Change Notifications (TABLE_NAMES)

    These notifications are triggered when specific data records are modified:

    * **acceptance:** An acceptance record changed. *(Triggers `riskNotifier`)*
    * **action:** An action record changed. *(Triggers `actionNotifier`)*
    * **action_update:** An action update record changed. *(Triggers `actionNotifier`)*
    * **appetite:** An appetite record changed. *(Triggers `riskNotifier`)*
    * **approver_response:** An approver response record changed. *(Triggers `changeRequestNotifier`)*
    * **attestation_record:** An attestation record changed. *(Triggers `attestationNotifier`)*
    * **cause:** A cause record changed. *(Triggers `issueNotifier`)*
    * **consequence:** A consequence record changed. *(Triggers `issueNotifier`)*
    * **control:** A control record changed. *(Triggers `controlNotifier`)*
    * **document:** A document record changed. *(Triggers `documentNotifier`)*
    * **document_file:** A document file record changed. *(Triggers `documentNotifier`)*
    * **indicator:** An indicator record changed. *(Triggers `riskNotifier`, `controlNotifier`)*
    * **indicator_result:** An indicator result record changed. *(Triggers `riskNotifier`, `controlNotifier`)*
    * **issue:** An issue record changed. *(Triggers `issueNotifier`)*
    * **issue_update:** An issue update record changed. *(Triggers `issueNotifier`)*
    * **performance:** A performance record changed. *(Triggers `controlNotifier`)*
    * **risk:** A risk record changed. *(Triggers `riskNotifier`)*
    * **risk_assessment_result:** A risk assessment result record changed. *(Triggers `riskNotifier`)*
    * **test_result:** A test result record changed. *(Triggers `controlNotifier`)*
    * **third_party_response:** A third-party response record changed. *(Triggers `thirdPartyResponseSubmittedNotifier`)*
    * **user_group:** A user group record changed. *(Triggers `userGroupProvider`)*
    * **user_group_user:** A user group user record changed. *(Triggers `userGroupUserSubscriber`)*
