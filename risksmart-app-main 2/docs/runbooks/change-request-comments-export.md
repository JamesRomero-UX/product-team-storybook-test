# Change request data export with approver comments

## Introduction

Originally requested in [RSP-3454](https://linear.app/risksmart/issue/RSP-3454/investigate-feasibility-of-a-csv-export-for-change-request-comments). The customer has requested a CSV export of their change request data with the approver comments included as we do not currently expose these comments in the application.

## Steps

Run the following script replacing the OrgKey.

```SQL
SELECT
 req."Id" AS "ChangeRequestUUId",
 CONCAT('CR-',req."SequentialId") AS "ChangeRequestId",
 req."CreatedAtTimestamp" AS "DateRequestRaised",
 req."ChangeRequestStatus",
 au4."FriendlyName" as "ChangeRequestCreatedBy",
 req."ParentId",
 CASE
  WHEN nod."ObjectType" = 'risk'     THEN rsk."Title"
  WHEN nod."ObjectType" = 'control'    THEN ctl."Title"
  WHEN nod."ObjectType" = 'document_file'  THEN doc."Title"
  WHEN nod."ObjectType" = 'acceptance'  THEN acc."Title"
  WHEN nod."ObjectType" = 'action'   THEN act."Title"
  WHEN nod."ObjectType" = 'issue'    THEN iss."Title"
  WHEN nod."ObjectType" = 'issue_assessment' THEN iss."Title"
  ELSE 'UNKNOWN TYPE'
 END AS "ParentName",

 req."Type" AS "Operation",
 nod."ObjectType" AS "Type",
 lev."SequenceOrder" AS "ApprovalLevel",
 CASE
  WHEN apr."UserGroupId" IS NOT NULL THEN usg."Name" -- user group approver
  WHEN apr."OwnerApprover" IS true THEN 'Owner'
   WHEN au2."FriendlyName" IS NOT NULL THEN au2."FriendlyName"
 END AS "Approver",
 au5."FriendlyName" AS "ApprovedByUser",
 CASE
  WHEN rps."Approved" = true THEN true ELSE false
 END AS "Approved",
 rps."ApprovedAtTimestamp" AS "ApprovedAt",
 rps."Comment" AS "ApproverComment"

FROM risksmart.approver_response   rps
JOIN risksmart.approver     apr ON apr."Id" = rps."ApproverId"
JOIN risksmart.approval_level   lev ON lev."Id" = apr."LevelId"
JOIN risksmart.change_request   req ON req."Id" = rps."ChangeRequestId"
JOIN risksmart.node      nod ON nod."Id" = req."ParentId"

LEFT JOIN risksmart.user_group   usg ON apr."UserGroupId" = usg."Id"

LEFT JOIN auth.user      au2 ON au2."Id" = apr."UserId"
JOIN auth.user       au4 ON au4."Id" = req."CreatedByUser"
LEFT JOIN auth.user      au5 ON au5."Id" = rps."ApprovedByUser"

LEFT JOIN risksmart.risk    rsk ON rsk."Id" = req."ParentId"
LEFT JOIN risksmart.control    ctl ON ctl."Id" = req."ParentId"
LEFT JOIN risksmart.document_file  dof ON dof."Id" = req."ParentId"
LEFT JOIN risksmart.document   doc ON doc."Id" = dof."ParentDocumentId"
LEFT JOIN risksmart.acceptance   acc ON acc."Id" = req."ParentId"
LEFT JOIN risksmart.action    act ON act."Id" = req."ParentId"
LEFT JOIN risksmart.issue    iss ON iss."Id" = req."ParentId"
WHERE req."OrgKey" = '<orgkey here>'
ORDER BY req."CreatedAtTimestamp", lev."SequenceOrder"
```
