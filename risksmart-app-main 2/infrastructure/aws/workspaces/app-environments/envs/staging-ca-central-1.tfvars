#
# Generic
#
account_id  = "629531182017"
environment = "staging"
region      = "ca-central-1"

#
# Network
#
# availability_zones = ["ca-central-1a", "ca-central-1b", "ca-central-1c"]
alb_name           = "CA-1-s-stagi-RFqlRuu0FeN0"
certificate_domain = "ca.staging-app-tenant.629531182017.risksmart.link"
vpc_id             = "vpc-05c729a6109cdfc64"

#
# ECS
#
ecs_cluster_name = "CA-1-staging-app-allTenants-cluster"

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
alb_internal_vpc_id = "vpc-05c729a6109cdfc64"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from staging account — PermissionsHandlerSecurityGroup and dataLayerSg
]
alb_internal_permit_security_group_id = "" # TODO: CA-1-staging-app-permit-FargateSecurityGroup
