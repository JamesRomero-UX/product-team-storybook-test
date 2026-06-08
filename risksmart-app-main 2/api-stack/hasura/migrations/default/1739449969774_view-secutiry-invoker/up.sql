ALTER VIEW risksmart.contributor_view
SET (security_invoker = true);

ALTER VIEW risksmart.ancestor_contributor_view
SET (security_invoker = true);

ALTER VIEW risksmart.insert_permission_view
SET (security_invoker = true);

ALTER VIEW risksmart.audit_log_view
SET (security_invoker = true);

ALTER VIEW risksmart.permission_view
SET (security_invoker = true);

ALTER VIEW risksmart.action_update_summary_view
SET (security_invoker = true);

ALTER VIEW risksmart.user_view_active
SET (security_invoker = true);

ALTER VIEW risksmart.audit_log
SET (security_invoker = true);

ALTER VIEW risksmart.node_ancestor_view
SET (security_invoker = true);

ALTER VIEW risksmart.user_role_access
SET (security_invoker = true);