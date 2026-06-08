#
# Generic
#
account_id  = "046657674620"
environment = "tech-admin"
region      = "eu-west-2"

#
# Network
#
# availability_zones = ["eu-west-2a", "eu-west-2b"]
alb_name           = "tech-a-techa-AaM6cwvww9mZ"
certificate_domain = "tech-admin-risksmartApp-tenant.046657674620.risksmart.link"
vpc_id             = "vpc-0ef9c10895505c8b0"

#
# ECS
#
ecs_cluster_name = "tech-admin-risksmartApp-allTenants-cluster"

#
# Enabled Services
#
alb_internal_enabled       = false
hybiscus_enabled           = false
waf_cloudfront_api_enabled = false
waf_cloudfront_tpp_enabled = false
