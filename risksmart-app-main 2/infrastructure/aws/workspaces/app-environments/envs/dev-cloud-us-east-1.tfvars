#
# Generic
#
account_id  = "640196420962"
environment = "dev-cloud"
region      = "us-east-1"

#
# Network
#
# availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
alb_name           = "US-1-d-devcl-8qPEalpRP1K9"
certificate_domain = "us.dev-cloud-int.640196420962.risksmart.link"
vpc_id             = "vpc-0111f2d93dcc17416"

#
# ECS
#
ecs_cluster_name = "US-1-dev-cloud-app-allTenants-cluster"

#
# Enabled Services
#
alb_internal_enabled       = false
hybiscus_enabled           = false
waf_cloudfront_api_enabled = true
waf_cloudfront_tpp_enabled = true

#
# Service Variables
#
alb_internal_vpc_id = "vpc-00db354611a7654a2"
alb_internal_lambda_security_group_ids = [
  "sg-0778890bd00eb346c",  # PermissionsHandlerSecurityGroup
  "sg-0ad05766f17515d5b",  # dataLayerSg
]
alb_internal_permit_security_group_id = "sg-05f8a2fd7c91dd3e3" # dev-cloud-risksmartApp-permit-FargateSecurityGroup
