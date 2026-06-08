#
# Generic
#
account_id  = "640196420962"
environment = "dev-cloud"
region      = "me-central-1"

#
# Network
#
# availability_zones = ["me-central-1a", "me-central-1b", "me-central-1c"]
alb_name           = "UAE-1--devcl-Fs5ThDe3lM1h"
certificate_domain = "uae.dev-cloud-int.640196420962.risksmart.link"
vpc_id             = "vpc-05e3e4601a658da3f"

#
# ECS
#
ecs_cluster_name = "UAE-1-dev-cloud-app-allTenants-cluster"

#
# Enabled Services
#
alb_internal_enabled       = false
hybiscus_enabled           = false
waf_cloudfront_api_enabled = false
waf_cloudfront_tpp_enabled = false

#
# Service Variables
#
alb_internal_vpc_id = "vpc-05e3e4601a658da3f"
alb_internal_lambda_security_group_ids = [
  "sg-027a114899e56a337",  # PermissionsHandlerSecurityGroup
  "sg-071e229625d4d74cd",  # dataLayerSg
]
alb_internal_permit_security_group_id = "sg-016dd1d8b1879625c" # dev-cloud-risksmartApp-permit-FargateSecurityGroup
