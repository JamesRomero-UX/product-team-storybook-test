terraform {
  required_version = ">= 1.11.3"

  backend "s3" {
  }

  required_providers {
    permitio = {
      source  = "permitio/permit-io"
      version = "~> 0.0.20"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.28"
    }
  }
}

provider "permitio" {
  api_url = "https://api.permit.io"
  api_key = local.permit_api_key
  timeout = 60
}

provider "aws" {
  region = local.region
  default_tags {
    tags = {
      Environment = var.account_name
      Owner       = "developers"
      Project     = "risksmart-app"
      Region      = local.region
      Account     = var.account_name
      Terraform   = "true"
      CreatedBy   = "Terraform"
    }
  }
}
