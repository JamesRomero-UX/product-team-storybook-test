#
# Generic
#
account_id  = "640196420962"
environment = "dev-cloud"
region      = "eu-west-2"

#
# Network
#
# availability_zones = ["eu-west-2a", "eu-west-2b"]
alb_name           = "dev-cl-devcl-NygOXY446H79"
certificate_domain = "dev-cloud-int.640196420962.risksmart.link"
vpc_id             = "vpc-0111f2d93dcc17416"

#
# ECS
#
ecs_cluster_name = "dev-cloud-risksmartApp-allTenants-cluster"

#
# Enabled Services
#
alb_internal_enabled       = true
hybiscus_enabled           = true
waf_cloudfront_api_enabled = false
waf_cloudfront_tpp_enabled = false

#
# Service Variables
#
alb_internal_vpc_id = "vpc-0111f2d93dcc17416"
alb_internal_lambda_security_group_ids = [
  "sg-0e155c757ff6f7e81",  # PermissionsHandlerSecurityGroup
  "sg-0ce22fbba19285d4d",  # dataLayerSg
]
alb_internal_permit_security_group_id = "sg-0368ff4a9cf550769" # dev-cloud-risksmartApp-permit-FargateSecurityGroup
