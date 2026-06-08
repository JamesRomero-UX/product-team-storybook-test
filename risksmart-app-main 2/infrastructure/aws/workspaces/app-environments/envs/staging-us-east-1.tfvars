#
# Generic
#
account_id  = "629531182017"
environment = "staging"
region      = "us-east-1"

#
# Network
#
# availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
alb_name           = "US-1-s-stagi-kS8YnKPmDxpo"
certificate_domain = "us.staging-app-tenant.629531182017.risksmart.link"
vpc_id             = "vpc-0a1c06c1b5243f8a5"

#
# ECS
#
ecs_cluster_name = "US-1-staging-app-allTenants-cluster"

#
# Enabled Services
#
alb_internal_enabled       = true
hybiscus_enabled           = false
waf_cloudfront_api_enabled = true
waf_cloudfront_tpp_enabled = true

#
# Internal ALB (RSP-3702: Lambda → Permit Fargate routing)
#
alb_internal_vpc_id = "vpc-0a1c06c1b5243f8a5"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from staging account — PermissionsHandlerSecurityGroup and dataLayerSg
  "sg-03d0ff5dc44ffed10", # dataLayerSg
  "sg-03cb0268c34ca9e55" # PermissionsHandlerSecurityGroup
]
alb_internal_permit_security_group_id = "sg-0e954868f9f837c20" # TODO: US-1-staging-app-permit-FargateSecurityGroup
