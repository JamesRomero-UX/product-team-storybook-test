#
# Generic
#
account_id  = "640196420962"
environment = "dev-cloud"
region      = "ca-central-1"

#
# Network
#
# availability_zones = ["ca-central-1a", "ca-central-1b", "ca-central-1c"]
alb_name           = "CA-1-d-devcl-YX3tO0nwt1rI"
certificate_domain = "ca.dev-cloud-int.640196420962.risksmart.link"
vpc_id             = "vpc-036991ca5bf33d424"

#
# ECS
#
ecs_cluster_name = "CA-1-dev-cloud-app-allTenants-cluster"

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
alb_internal_vpc_id = "vpc-036991ca5bf33d424"
alb_internal_lambda_security_group_ids = [
  "sg-02d34ae5163a3a08f",  # PermissionsHandlerSecurityGroup
  "sg-0797628759fb2e1ad",  # dataLayerSg
]
alb_internal_permit_security_group_id = "sg-0437ee00fcee516ea" # dev-cloud-risksmartApp-permit-FargateSecurityGroup
