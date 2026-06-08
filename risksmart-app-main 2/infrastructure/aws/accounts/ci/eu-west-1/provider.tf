terraform {
  required_version = ">= 1.11.3"

  backend "s3" {
    bucket         = "${local.account_name}-${local.region}-risksmart-terraform-state"
    key            = "terraform/${local.account_name}/${local.region}/terraform.tfstate"
    region         = local.region
    encrypt        = true
    dynamodb_table = "${local.account_name}-${local.region}-risksmart-terraform-lock"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.28"
    }
  }
}

provider "aws" {
  region = local.region
  default_tags {
    tags = {
      Environment = local.account_name
      Owner       = "operations"
      Project     = "risksmart-app"
      Region      = local.region
      Account     = local.account_name
      Terraform   = "true"
      CreatedBy   = "Terraform"
    }
  }
}
