#
# Generic
#
account_id  = "629531182017"
environment = "staging"
region      = "me-central-1"

#
# Network
#
# availability_zones = ["me-central-1a", "me-central-1b", "me-central-1c"]
alb_name           = "UAE-1--stagi-AQ7Xod9QVo0m"
certificate_domain = "uae.staging-app-tenant.629531182017.risksmart.link"
vpc_id             = "vpc-0dee7fdfc3a0c3c54"

#
# ECS
#
ecs_cluster_name = "UAE-1-staging-app-allTenants-cluster"

#
# Enabled Services
#
alb_internal_enabled       = false
hybiscus_enabled           = false
waf_cloudfront_api_enabled = false
waf_cloudfront_tpp_enabled = false

#
# Internal ALB (RSP-3702: Lambda → Permit Fargate routing)
#
alb_internal_vpc_id = "vpc-0dee7fdfc3a0c3c54"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from staging account — PermissionsHandlerSecurityGroup and dataLayerSg
]
alb_internal_permit_security_group_id = "" # TODO: UAE-1-staging-app-permit-FargateSecurityGroup
