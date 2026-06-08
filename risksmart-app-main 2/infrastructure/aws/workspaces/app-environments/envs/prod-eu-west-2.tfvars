#
# Generic
#
account_id  = "826351825809"
environment = "prod"
region      = "eu-west-2"

#
# Network
#
# availability_zones = ["eu-west-2a", "eu-west-2b"]
alb_name           = "app-r-appri-7EW3KGEKNO6K"
certificate_domain = "app-risksmartapp-tenant.826351825809.risksmart.link"
vpc_id             = "vpc-05070660fdc026ee9"

#
# ECS
#
ecs_cluster_name = "app-risksmartApp-allTenants-cluster"

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
alb_internal_vpc_id = "vpc-05070660fdc026ee9"
alb_internal_lambda_security_group_ids = [
  # TODO: Look up from prod account — PermissionsHandlerSecurityGroup and dataLayerSg
  "sg-04ab7fcd740dabd98", # dataLayerSg
  "sg-02e9f56083ec4067b" # PermissionsHandlerSecurityGroup
]
alb_internal_permit_security_group_id = "sg-06bfc903fe16eeeab" # TODO: app-risksmartApp-permit-FargateSecurityGroup
