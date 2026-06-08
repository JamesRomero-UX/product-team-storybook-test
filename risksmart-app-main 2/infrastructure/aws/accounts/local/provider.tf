provider "aws" {
  # For local development (uses RustFS for S3, DynamoDB Local, etc.)
  alias                       = "local"
  region                      = "eu-west-2"
  access_key                  = "000000000000"
  secret_key                  = "000000000000"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  endpoints {
    s3  = "http://localhost:9000"
    sts = "http://localhost:9000"
  }
}

terraform {
  required_version = ">= 1.11.3"

  backend "local" {
    path = "terraform.tfstate"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.28"
    }
  }
}
