terraform {
  required_version = ">= 1.11.3"

  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.28"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Environment = var.environment
      Owner       = "operations"
      Project     = "risksmart-app"
      Region      = var.region
      Account     = var.environment
      Terraform   = "true"
      CreatedBy   = "Terraform"
      env         = var.environment
    }
  }
}
