#
# Generic
#
account_id  = "629531182017"
environment = "staging"
region      = "eu-west-2"

#
# Network
#
# availability_zones = ["eu-west-2a", "eu-west-2b"]
alb_name           = "stagi-stagi-1IDRDHGXZQEZ9"
certificate_domain = "staging-risksmartapp-tenant.629531182017.risksmart.link"
vpc_id             = "vpc-08bf52118e4cabc27"

#
# ECS
#
ecs_cluster_name = "staging-risksmartApp-allTenants-cluster"

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
alb_internal_vpc_id = "vpc-08bf52118e4cabc27"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from staging account — PermissionsHandlerSecurityGroup and dataLayerSg
  "sg-044a4c0897b338dea", # dataLayerSg
  "sg-082cfa26c8146a451" # PermissionsHandlerSecurityGroup
]
alb_internal_permit_security_group_id = "sg-0ee3c14cfd59805a6" # TODO: staging-risksmartApp-permit-FargateSecurityGroup
