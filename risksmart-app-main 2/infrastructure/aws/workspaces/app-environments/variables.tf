variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "ci_account_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "ci_account_id" {
  description = "AWS account ID for the CI account"
  type        = string
  default     = "437474201705"
}

variable "vpc_id" {
  description = "VPC ID for the AI Engine ECS tasks"
  type        = string
  default     = "vpc-0ef9c10895505c8b0"
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "risksmartAppCluster"
}

variable "alb_name" {
  description = "Name of the Application Load Balancer"
  type        = string
  default     = "risksmartAppALB"
}

variable "certificate_domain" {
  description = "Domain name for the SSL certificate"
  type        = string
  default     = "risksmart.link"
}
