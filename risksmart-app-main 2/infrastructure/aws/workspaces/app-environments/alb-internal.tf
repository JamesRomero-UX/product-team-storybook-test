# Internal Application Load Balancer for RSP-3702
# https://linear.app/risksmart/issue/RSP-3702/route-traffic-internally-between-lambdas-in-vpc-to-the-permit-fargate
#
# This creates an internal ALB for routing traffic between Lambda functions in
# the VPC and the Permit Fargate service. Traffic never leaves the VPC since the
# ALB is internal-only.
#
# The target group is associated with the Permit Fargate service using the ECS
# attachment within CDK (not in this Terraform module). Values are passed to CDK
# using SSM Parameters. It is assumed Tofu will be ran first, and then CDK,
# which has a variable to enable/disable attaching the target group.
#
# Network Flow:
# 1. Lambda function makes request to internal ALB DNS name
# 2. Internal ALB (dev-cloud-internal-alb, DNS: *.eu-west-2.elb.amazonaws.com:80)
# 3. ALB Security Group (dev-cloud-internal-alb-sg)
#      - Ingress: TCP 80 from Lambda SGs
#      - Egress: All traffic to VPC CIDR (172.31.0.0/16)
# 4. HTTP Listener (port 80)
# 5. Target Group (permit, type: ip, port 7000)
# 6. Permit Fargate Task IP (registered by ECS service)
# 7. Permit Security Group (sg-0368ff4a9cf550769)
#      - Ingress: TCP 7000 from ALB SG
# 8. Permit Container (port 7000, health check: /healthy)

# Auto-discover VPC CIDR block
data "aws_vpc" "alb_internal" {
  count = var.alb_internal_enabled ? 1 : 0
  id    = var.alb_internal_vpc_id
}

# Auto-discover private subnets based on VPC ID and tag pattern
data "aws_subnets" "alb_internal_private" {
  count = var.alb_internal_enabled ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [var.alb_internal_vpc_id]
  }

  filter {
    name   = "tag:Name"
    values = ["*private*"]
  }
}

variable "alb_internal_enabled" {
  description = "Whether to enable deploying an internal ALB or not"
  type        = bool
  default     = false
}

variable "alb_internal_vpc_id" {
  description = "The VPC ID where the internal ALB will be created"
  type        = string
  default     = ""
}

variable "alb_internal_lambda_security_group_ids" {
  description = "List of security group IDs used by Lambda functions that need to access the internal ALB"
  type        = list(string)
  default     = []
}

variable "alb_internal_permit_target_port" {
  description = "The port on which the Permit Fargate service is listening"
  type        = number
  default     = 7000
}

variable "alb_internal_permit_health_check_path" {
  description = "The health check path for the Permit Fargate service"
  type        = string
  default     = "/healthy"
}

variable "alb_internal_permit_security_group_id" {
  description = "The security group ID of the Permit Fargate service (to allow inbound traffic from ALB)"
  type        = string
  default     = ""
}

# Generate dynamic ingress rules for each Lambda security group
locals {
  alb_internal_lambda_ingress_rules = {
    for idx, sg_id in var.alb_internal_lambda_security_group_ids : "lambda_http_${idx}" => {
      from_port                    = 80
      to_port                      = 80
      ip_protocol                  = "tcp"
      description                  = "HTTP traffic from Lambda security group ${idx + 1}"
      referenced_security_group_id = sg_id
    }
  }
}

# Security group rule to allow traffic from internal ALB to Permit Fargate service
resource "aws_security_group_rule" "alb_internal_to_permit" {
  count = var.alb_internal_enabled && var.alb_internal_permit_security_group_id != "" ? 1 : 0

  type                     = "ingress"
  from_port                = var.alb_internal_permit_target_port
  to_port                  = var.alb_internal_permit_target_port
  protocol                 = "tcp"
  description              = "Allow traffic from internal ALB"
  source_security_group_id = module.alb_internal.security_group_id
  security_group_id        = var.alb_internal_permit_security_group_id
}

# SSM Parameter to store the Permit target group ARN for CDK to consume
resource "aws_ssm_parameter" "alb_internal_permit_target_group_arn" {
  count = var.alb_internal_enabled ? 1 : 0

  name        = "/${var.environment}/${var.region}/internal-alb/permit-target-group-arn"
  description = "ARN of the internal ALB target group for the Permit Fargate service"
  type        = "String"
  value       = module.alb_internal.target_groups["permit"].arn
}

# SSM Parameter to store the internal ALB DNS name for CDK to consume
resource "aws_ssm_parameter" "alb_internal_dns_name" {
  count = var.alb_internal_enabled ? 1 : 0

  name        = "/${var.environment}/${var.region}/internal-alb/dns-name"
  description = "DNS name of the internal ALB for routing Lambda traffic to Permit service"
  type        = "String"
  value       = module.alb_internal.dns_name
}

module "alb_internal" {
  create = var.alb_internal_enabled

  source  = "terraform-aws-modules/alb/aws"
  version = "10.5.0"

  name     = "${var.environment}-internal-alb"
  vpc_id   = var.alb_internal_vpc_id
  subnets  = var.alb_internal_enabled ? data.aws_subnets.alb_internal_private[0].ids : []
  internal = true

  enable_deletion_protection = true
  drop_invalid_header_fields = true

  create_security_group = true
  security_group_name   = "${var.environment}-internal-alb-sg"

  security_group_ingress_rules = var.alb_internal_enabled ? local.alb_internal_lambda_ingress_rules : {}

  security_group_egress_rules = var.alb_internal_enabled ? {
    permit_service = {
      ip_protocol = "-1"
      cidr_ipv4   = data.aws_vpc.alb_internal[0].cidr_block
      description = "Allow outbound traffic to VPC (${data.aws_vpc.alb_internal[0].cidr_block})"
    }
  } : {}

  # HTTP Listener - forwards to Permit target group
  listeners = {
    http = {
      port     = 80
      protocol = "HTTP"

      forward = {
        target_group_key = "permit"
      }
    }
  }

  # Target Group for Permit Fargate Service
  target_groups = {
    permit = {
      name_prefix                       = "permit"
      protocol                          = "HTTP"
      port                              = var.alb_internal_permit_target_port
      target_type                       = "ip"
      deregistration_delay              = 30
      load_balancing_cross_zone_enabled = true

      health_check = {
        enabled             = true
        healthy_threshold   = 2
        unhealthy_threshold = 3
        interval            = 30
        matcher             = "200-299"
        path                = var.alb_internal_permit_health_check_path
        port                = "traffic-port"
        protocol            = "HTTP"
        timeout             = 5
      }

      # Target attachment is handled by ECS service, so we don't attach here
      create_attachment = false
    }
  }
}

# Outputs for the internal ALB
output "alb_internal_id" {
  description = "The ID of the internal ALB"
  value       = module.alb_internal.id
}

output "alb_internal_arn" {
  description = "The ARN of the internal ALB"
  value       = module.alb_internal.arn
}

output "alb_internal_dns_name" {
  description = "The DNS name of the internal ALB (use this in Lambda to call the Permit service)"
  value       = module.alb_internal.dns_name
}

output "alb_internal_zone_id" {
  description = "The zone ID of the internal ALB"
  value       = module.alb_internal.zone_id
}

output "alb_internal_security_group_id" {
  description = "The security group ID of the internal ALB"
  value       = module.alb_internal.security_group_id
}

output "alb_internal_target_group_arns" {
  description = "Map of target group ARNs created"
  value       = { for k, v in module.alb_internal.target_groups : k => v.arn }
}

output "alb_internal_permit_target_group_arn" {
  description = "The ARN of the Permit target group (use this to attach the Permit ECS service)"
  value       = try(module.alb_internal.target_groups["permit"].arn, null)
}
