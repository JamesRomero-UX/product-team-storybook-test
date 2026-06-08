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
    }
  }
}

provider "aws" {
  alias  = "ci"
  region = var.ci_account_region
  assume_role {
    role_arn     = "arn:aws:iam::${var.ci_account_id}:role/OpenTofuCrossAccountAccessRole"
    session_name = "OpenTofuCrossAccountSession"
  }
  default_tags {
    tags = {
      Environment = "ci"
      Owner       = "operations"
      Project     = "risksmart-app"
      Region      = var.ci_account_region
      Account     = "ci"
      Terraform   = "true"
      CreatedBy   = "Terraform"
    }
  }
}
