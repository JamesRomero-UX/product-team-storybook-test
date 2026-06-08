terraform {
  required_version = ">= 1.11.3"

  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.84"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.28"
    }
  }
}
