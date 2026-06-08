#
# Generic
#
account_id  = "826351825809"
environment = "prod"
region      = "ca-central-1"

#
# Network
#
# availability_zones = ["ca-central-1a", "ca-central-1b", "ca-central-1c"]
alb_name           = "CA-1-a-appap-r4cKTe1JNBuk"
certificate_domain = "ca.app-app-tenant.826351825809.risksmart.link"
vpc_id             = "vpc-0304170e1e3e677d0"

#
# ECS
#
ecs_cluster_name = "CA-1-app-app-allTenants-cluster"

#
# Enabled Services
#
alb_internal_enabled       = true
hybiscus_enabled           = false
waf_cloudfront_api_enabled = false
waf_cloudfront_tpp_enabled = false

#
# Internal ALB (RSP-3702: Lambda → Permit Fargate routing)
#
alb_internal_vpc_id = "vpc-0304170e1e3e677d0"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from prod account — PermissionsHandlerSecurityGroup and dataLayerSg
  "sg-0a0f669e01609be2a", # dataLayerSg
  "sg-06a6fdc9e5dd517de" # PermissionsHandlerSecurityGroup
]
alb_internal_permit_security_group_id = "sg-0aaf246469e4d0359" # TODO: CA-1-app-app-permit-FargateSecurityGroup
