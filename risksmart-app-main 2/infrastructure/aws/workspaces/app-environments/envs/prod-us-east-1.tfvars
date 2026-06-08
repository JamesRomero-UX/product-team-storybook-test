#
# Generic
#
account_id  = "826351825809"
environment = "prod"
region      = "us-east-1"

#
# Network
#
# availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
alb_name           = "US-1-a-appap-cC95I1WjX8T4"
certificate_domain = "us.app-app-tenant.826351825809.risksmart.link"
vpc_id             = "vpc-0305647cb762b894d"

#
# ECS
#
ecs_cluster_name = "US-1-app-app-allTenants-cluster"

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
alb_internal_vpc_id = "vpc-0305647cb762b894d"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from prod account — PermissionsHandlerSecurityGroup and dataLayerSg
  "sg-062eb530e03b266e5", # dataLayerSg
  "sg-0ebdfd7f95de33a29" # PermissionsHandlerSecurityGroup
]
alb_internal_permit_security_group_id = "sg-0782c9239a1f33d61" # TODO: US-1-app-app-permit-FargateSecurityGroup
