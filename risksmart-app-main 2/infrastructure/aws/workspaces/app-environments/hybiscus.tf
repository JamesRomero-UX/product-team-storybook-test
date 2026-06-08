# Hybiscus PDF Generation Services Configuration
#
# This configuration creates a complete Hybiscus deployment with:
# - API service for PDF generation requests
# - Worker service for background PDF processing
# - Redis cache for task queue and session management
# - EFS file system for shared storage between API and Worker services
# - Service Discovery namespace for inter-service communication
# - Security groups and IAM policies for service access

variable "hybiscus_enabled" {
  description = "Whether to enable deploying Hybiscus services or not"
  type        = bool
  default     = false
}

variable "hybiscus_repository_name" {
  description = "The name of the ECR repository for Hybiscus."
  type        = string
  default     = "hybiscusdev/managed-cloud-api"
}

variable "hybiscus_image_tag" {
  description = "Docker image tag for Hybiscus API and Worker. Use versioned tag to ensure ECS pulls new images and creates new task definitions. DO NOT use 'latest'."
  type        = string
  default     = "v1.8"
}

variable "hybiscus_api_cpu" {
  description = "CPU units for the Hybiscus API task"
  type        = string
  default     = "512" # .5 vCPU
}

variable "hybiscus_api_memory" {
  description = "Memory for the Hybiscus API task"
  type        = string
  default     = "1024" # 1 GB
}

variable "hybiscus_api_desired_count" {
  description = "Desired count of Hybiscus API tasks"
  type        = number
  default     = 1
}

variable "hybiscus_worker_cpu" {
  description = "CPU units for the Hybiscus Worker task"
  type        = string
  default     = "512" # .5 vCPU
}

variable "hybiscus_worker_memory" {
  description = "Memory for the Hybiscus Worker task"
  type        = string
  default     = "1024" # 1 GB
}

variable "hybiscus_worker_desired_count" {
  description = "Desired count of Hybiscus Worker tasks"
  type        = number
  default     = 1
}

variable "hybiscus_redis_cpu" {
  description = "CPU units for the Hybiscus Redis task"
  type        = string
  default     = "256" # .25 vCPU
}

variable "hybiscus_redis_memory" {
  description = "Memory for the Hybiscus Redis task"
  type        = string
  default     = "512" # 512 MB
}

variable "hybiscus_redis_desired_count" {
  description = "Desired count of Hybiscus Redis tasks"
  type        = number
  default     = 1
}

data "aws_subnets" "private_subnets" {
  count = var.hybiscus_enabled ? 1 : 0

  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }

  filter {
    name   = "tag:Name"
    values = ["*private*"]
  }
}

data "aws_ecs_cluster" "risksmart_cluster" {
  count        = var.hybiscus_enabled ? 1 : 0
  cluster_name = var.ecs_cluster_name
}

data "aws_lb" "risksmart_alb" {
  count = var.hybiscus_enabled ? 1 : 0
  name  = var.alb_name
}

data "aws_security_groups" "alb_security_groups" {
  count = var.hybiscus_enabled ? 1 : 0

  filter {
    name   = "group-id"
    values = data.aws_lb.risksmart_alb[0].security_groups
  }
}

data "aws_lb_listener" "risksmart_https_listener" {
  count             = var.hybiscus_enabled ? 1 : 0
  load_balancer_arn = data.aws_lb.risksmart_alb[0].arn
  port              = 443
}

data "aws_secretsmanager_secret_version" "hybiscus_api_secrets" {
  count     = var.hybiscus_enabled ? 1 : 0
  secret_id = "${var.environment}-risksmartApp-hybiscus-Secret"
}

# Service Discovery Namespace for Hybiscus services
resource "aws_service_discovery_private_dns_namespace" "hybiscus" {
  count       = var.hybiscus_enabled ? 1 : 0
  name        = "hybiscus.${var.environment}.local"
  description = "Private DNS namespace for Hybiscus services"
  vpc         = var.vpc_id

  tags = {
    Service = "hybiscus"
  }
}

# Service Discovery Service for Redis
resource "aws_service_discovery_service" "hybiscus_redis" {
  count = var.hybiscus_enabled ? 1 : 0
  name  = "redis"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.hybiscus[0].id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  tags = {
    Service = "hybiscus"
  }
}

# EFS Shared Storage Module for API and Worker services
module "hybiscus_shared_storage" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/efs-shared-storage?ref=efs-shared-storage-v1.0.0"

  enabled = var.hybiscus_enabled

  service_name       = "hybiscus"
  environment        = var.environment
  vpc_id             = var.vpc_id
  private_subnet_ids = var.hybiscus_enabled ? data.aws_subnets.private_subnets[0].ids : []

  # Custom access point configuration for Hybiscus
  access_point_path = "/hybiscus-data"
  access_point_uid  = 1000
  access_point_gid  = 1000

  # Cost optimization settings
  transition_to_ia_policy      = "AFTER_1_DAY"
  transition_to_archive_policy = "AFTER_7_DAYS"

  tags = {
    Service = "hybiscus"
  }
}

# Security Group Rules for EFS (created after services to avoid circular dependency)
# These will be added separately since the module can't reference security groups that don't exist yet
resource "aws_security_group_rule" "efs_ingress_from_api" {
  count                    = var.hybiscus_enabled ? 1 : 0
  type                     = "ingress"
  from_port                = 2049
  to_port                  = 2049
  protocol                 = "tcp"
  source_security_group_id = module.hybiscus_api.ecs_security_group_id
  security_group_id        = module.hybiscus_shared_storage.security_group_id
  description              = "NFS traffic from Hybiscus API"
}

resource "aws_security_group_rule" "efs_ingress_from_worker" {
  count                    = var.hybiscus_enabled ? 1 : 0
  type                     = "ingress"
  from_port                = 2049
  to_port                  = 2049
  protocol                 = "tcp"
  source_security_group_id = module.hybiscus_worker.ecs_security_group_id
  security_group_id        = module.hybiscus_shared_storage.security_group_id
  description              = "NFS traffic from Hybiscus Worker"
}

# Security Group Rules for Redis access
resource "aws_security_group_rule" "redis_ingress_from_api" {
  count                    = var.hybiscus_enabled ? 1 : 0
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = module.hybiscus_api.ecs_security_group_id
  security_group_id        = aws_security_group.hybiscus_redis_ecs_sg[0].id
  description              = "Redis traffic from Hybiscus API"
}

resource "aws_security_group_rule" "redis_ingress_from_worker" {
  count                    = var.hybiscus_enabled ? 1 : 0
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = module.hybiscus_worker.ecs_security_group_id
  security_group_id        = aws_security_group.hybiscus_redis_ecs_sg[0].id
  description              = "Redis traffic from Hybiscus Worker"
}

# Local values for consistent naming and configuration
locals {
  # Truncate environment names to meet AWS resource naming length limits
  hybiscus_api_name_prefix    = "pdf-api-${substr(var.environment, 0, 10)}"
  hybiscus_worker_name_prefix = "pdf-worker-${substr(var.environment, 0, 5)}"
  hybiscus_redis_name_prefix  = "pdf-redis-${substr(var.environment, 0, 5)}"

  # Construct ECR repository URL using CI account to avoid cross-account permission issues
  hybiscus_ecr_repository_url = "${var.ci_account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.hybiscus_repository_name}"

  # Common environment variables shared between API and Worker services
  hybiscus_common_vars = var.hybiscus_enabled ? merge(
    {
      ENABLE_ASYNC_API = "true"
      REDIS_HOST       = "redis.hybiscus.${var.environment}.local"
      REDIS_PORT       = "6379"
    },
    jsondecode(data.aws_secretsmanager_secret_version.hybiscus_api_secrets[0].secret_string)
  ) : {}
}


# Hybiscus API Fargate Service
module "hybiscus_api" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/fargate-service?ref=fargate-service-v1.0.0"

  enabled = var.hybiscus_enabled

  # Service Configuration
  service_name  = "hybiscus-api"
  environment   = var.environment
  region        = var.region
  ci_account_id = var.ci_account_id

  # Networking
  vpc_id             = var.vpc_id
  private_subnet_ids = var.hybiscus_enabled ? data.aws_subnets.private_subnets[0].ids : []
  ecs_cluster_id     = var.hybiscus_enabled ? data.aws_ecs_cluster.risksmart_cluster[0].id : ""

  # ALB Configuration
  alb_security_group_ids = var.hybiscus_enabled ? data.aws_security_groups.alb_security_groups[0].ids : []
  alb_listener_arn       = var.hybiscus_enabled ? data.aws_lb_listener.risksmart_https_listener[0].arn : ""
  listener_rule_priority = 7780
  path_patterns          = ["/hybiscus/*"]

  # ECR Configuration
  ecr_repository_url  = local.hybiscus_ecr_repository_url
  ecr_repository_name = var.hybiscus_repository_name

  # Container Configuration
  container_name        = "hybiscus-api"
  container_port        = 3000
  image_tag             = var.hybiscus_image_tag
  cpu                   = var.hybiscus_api_cpu
  memory                = var.hybiscus_api_memory
  desired_count         = var.hybiscus_api_desired_count
  environment_variables = local.hybiscus_common_vars

  # Path Stripping Configuration
  enable_path_stripping = true
  strip_path_prefix     = "/hybiscus"
  nginx_proxy_port      = 80

  # EFS Configuration
  efs_file_system_id       = module.hybiscus_shared_storage.file_system_id
  efs_access_point_id      = module.hybiscus_shared_storage.access_point_id
  efs_mount_path           = "/usr/app/data"
  additional_task_policies = [module.hybiscus_shared_storage.iam_policy_arn]

  # Health Check Configuration - ALB checks full path, nginx forwards to container
  health_check_path    = "/health"
  health_check_command = "curl -f http://localhost:3000/docs || exit 1"

  # Target Group Configuration
  target_group_name_prefix = local.hybiscus_api_name_prefix

  tags = {
    Service = "hybiscus"
  }
}

# Hybiscus Worker Fargate Service
module "hybiscus_worker" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/fargate-service?ref=fargate-service-v1.0.0"

  enabled = var.hybiscus_enabled

  # Service Configuration
  service_name  = "hybiscus-worker"
  environment   = var.environment
  region        = var.region
  ci_account_id = var.ci_account_id
  expose_port   = false

  # Networking
  vpc_id             = var.vpc_id
  private_subnet_ids = var.hybiscus_enabled ? data.aws_subnets.private_subnets[0].ids : []
  ecs_cluster_id     = var.hybiscus_enabled ? data.aws_ecs_cluster.risksmart_cluster[0].id : ""

  # ECR Configuration
  ecr_repository_url  = local.hybiscus_ecr_repository_url
  ecr_repository_name = var.hybiscus_repository_name

  # Container Configuration
  container_name        = "hybiscus-worker"
  image_tag             = var.hybiscus_image_tag
  cpu                   = var.hybiscus_worker_cpu
  memory                = var.hybiscus_worker_memory
  desired_count         = var.hybiscus_worker_desired_count
  environment_variables = local.hybiscus_common_vars
  entrypoint            = ["./entrypoint-worker.sh"]

  # EFS Configuration
  efs_file_system_id       = module.hybiscus_shared_storage.file_system_id
  efs_access_point_id      = module.hybiscus_shared_storage.access_point_id
  efs_mount_path           = "/usr/app/data"
  additional_task_policies = [module.hybiscus_shared_storage.iam_policy_arn]

  # Health Check Configuration
  health_check_command = "ps aux | grep '[.]/entrypoint-worker.sh' || exit 1"

  # Target Group Configuration
  target_group_name_prefix = local.hybiscus_worker_name_prefix

  tags = {
    Service = "hybiscus"
  }
}

# Redis Infrastructure - Standalone Fargate service for caching and task queue

# Security Group for Redis ECS Tasks
resource "aws_security_group" "hybiscus_redis_ecs_sg" {
  count       = var.hybiscus_enabled ? 1 : 0
  name_prefix = "hybiscus-redis-ecs-${var.environment}-"
  description = "Security group for Hybiscus Redis ECS tasks"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Service = "hybiscus"
  }
}

module "hybiscus_redis" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/fargate-service?ref=fargate-service-v1.0.0"

  enabled = var.hybiscus_enabled

  # Service Configuration
  service_name         = "hybiscus-redis"
  environment          = var.environment
  region               = var.region
  ci_account_id        = var.ci_account_id
  expose_port          = false
  service_registry_arn = var.hybiscus_enabled ? aws_service_discovery_service.hybiscus_redis[0].arn : null

  # Networking
  vpc_id                    = var.vpc_id
  private_subnet_ids        = var.hybiscus_enabled ? data.aws_subnets.private_subnets[0].ids : []
  ecs_cluster_id            = var.hybiscus_enabled ? data.aws_ecs_cluster.risksmart_cluster[0].id : ""
  custom_security_group_ids = var.hybiscus_enabled ? [aws_security_group.hybiscus_redis_ecs_sg[0].id] : []

  # ECR Configuration
  ecr_repository_url = "public.ecr.aws/docker/library/redis"

  # Container Configuration
  container_name = "hybiscus-redis"
  image_tag      = "7.2-alpine"
  cpu            = var.hybiscus_redis_cpu
  memory         = var.hybiscus_redis_memory
  desired_count  = var.hybiscus_redis_desired_count

  # Health Check Configuration
  health_check_command = "redis-cli ping || exit 1"

  # Target Group Configuration
  target_group_name_prefix = local.hybiscus_redis_name_prefix

  tags = {
    Service = "hybiscus"
  }
}

# CloudWatch Logs policy for Redis service (required for public ECR images)
resource "aws_iam_policy" "hybiscus_redis_logs_policy" {
  count       = var.hybiscus_enabled ? 1 : 0
  name        = "hybiscus-redis-logs-policy-${var.environment}"
  description = "Policy for Hybiscus Redis CloudWatch Logs access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.region}:${var.account_id}:log-group:${module.hybiscus_redis.cloudwatch_log_group_name}:*"
      }
    ]
  })

  tags = {
    Service = "hybiscus"
  }
}

# Attach the logs policy to the Redis execution role
resource "aws_iam_role_policy_attachment" "hybiscus_redis_logs_policy" {
  count      = var.hybiscus_enabled ? 1 : 0
  role       = module.hybiscus_redis.task_execution_role_name
  policy_arn = aws_iam_policy.hybiscus_redis_logs_policy[0].arn
}

# Outputs - API Service
output "hybiscus_api_ecs_service_arn" {
  description = "ARN of the Hybiscus API ECS service"
  value       = module.hybiscus_api.ecs_service_arn
}

output "hybiscus_api_ecs_service_name" {
  description = "Name of the Hybiscus API ECS service"
  value       = module.hybiscus_api.ecs_service_name
}

output "hybiscus_api_target_group_arn" {
  description = "ARN of the Hybiscus API target group"
  value       = module.hybiscus_api.target_group_arn
}

output "hybiscus_api_ecs_security_group_id" {
  description = "ID of the Hybiscus API ECS security group"
  value       = module.hybiscus_api.ecs_security_group_id
}

output "hybiscus_api_task_definition_arn" {
  description = "ARN of the Hybiscus API task definition"
  value       = module.hybiscus_api.task_definition_arn
}

# Outputs - Worker Service
output "hybiscus_worker_ecs_service_arn" {
  description = "ARN of the Hybiscus Worker ECS service"
  value       = module.hybiscus_worker.ecs_service_arn
}

output "hybiscus_worker_ecs_service_name" {
  description = "Name of the Hybiscus Worker ECS service"
  value       = module.hybiscus_worker.ecs_service_name
}

output "hybiscus_worker_ecs_security_group_id" {
  description = "ID of the Hybiscus Worker ECS security group"
  value       = module.hybiscus_worker.ecs_security_group_id
}

output "hybiscus_worker_task_definition_arn" {
  description = "ARN of the Hybiscus Worker task definition"
  value       = module.hybiscus_worker.task_definition_arn
}

# Outputs - EFS File System
output "hybiscus_efs_file_system_id" {
  description = "ID of the Hybiscus EFS file system"
  value       = module.hybiscus_shared_storage.file_system_id
}

output "hybiscus_efs_file_system_arn" {
  description = "ARN of the Hybiscus EFS file system"
  value       = module.hybiscus_shared_storage.file_system_arn
}

output "hybiscus_efs_dns_name" {
  description = "DNS name of the Hybiscus EFS file system"
  value       = module.hybiscus_shared_storage.file_system_dns_name
}

output "hybiscus_efs_access_point_id" {
  description = "ID of the Hybiscus EFS access point"
  value       = module.hybiscus_shared_storage.access_point_id
}

output "hybiscus_efs_access_point_arn" {
  description = "ARN of the Hybiscus EFS access point"
  value       = module.hybiscus_shared_storage.access_point_arn
}

# Outputs - Redis Service
output "hybiscus_redis_ecs_service_arn" {
  description = "ARN of the Hybiscus Redis ECS service"
  value       = module.hybiscus_redis.ecs_service_arn
}

output "hybiscus_redis_ecs_service_name" {
  description = "Name of the Hybiscus Redis ECS service"
  value       = module.hybiscus_redis.ecs_service_name
}

output "hybiscus_redis_ecs_security_group_id" {
  description = "ID of the Hybiscus Redis ECS security group"
  value       = module.hybiscus_redis.ecs_security_group_id
}

output "hybiscus_redis_task_definition_arn" {
  description = "ARN of the Hybiscus Redis task definition"
  value       = module.hybiscus_redis.task_definition_arn
}

# Outputs - Service Discovery
output "hybiscus_service_discovery_namespace_id" {
  description = "ID of the Hybiscus service discovery namespace"
  value       = var.hybiscus_enabled ? aws_service_discovery_private_dns_namespace.hybiscus[0].id : null
}

output "hybiscus_service_discovery_namespace_name" {
  description = "Name of the Hybiscus service discovery namespace"
  value       = var.hybiscus_enabled ? aws_service_discovery_private_dns_namespace.hybiscus[0].name : null
}

output "hybiscus_redis_service_discovery_arn" {
  description = "ARN of the Hybiscus Redis service discovery service"
  value       = var.hybiscus_enabled ? aws_service_discovery_service.hybiscus_redis[0].arn : null
}
