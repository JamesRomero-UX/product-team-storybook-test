#
# Generic
#
account_id  = "826351825809"
environment = "prod"
region      = "me-central-1"

#
# Network
#
# availability_zones = ["me-central-1a", "me-central-1b", "me-central-1c"]
alb_name           = "UAE-1--appap-qf35x06i3TxZ"
certificate_domain = "uae.app-app-tenant.826351825809.risksmart.link"
vpc_id             = "vpc-0db6592e9e4a534f3"

#
# ECS
#
ecs_cluster_name = "UAE-1-app-app-allTenants-cluster"

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
alb_internal_vpc_id = "vpc-0db6592e9e4a534f3"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from prod account — PermissionsHandlerSecurityGroup and dataLayerSg
  "sg-0c8ae2dd33782c1d2", # dataLayerSg
  "sg-0d219ff1ba00e5667" # PermissionsHandlerSecurityGroup
]
alb_internal_permit_security_group_id = "sg-01834374c7a2044c7" # TODO: UAE-1-app-app-permit-FargateSecurityGroup
