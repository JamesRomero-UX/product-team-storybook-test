# https://registry.terraform.io/providers/DataDog/datadog/latest/docs

# Authentication is via environment variables set in the CI/CD pipeline:
# - DD_API_KEY - Datadog API key
# - DD_APP_KEY - Datadog Application key

provider "datadog" {
  api_url = "https://api.datadoghq.eu"
}

# Production AWS Account
provider "aws" {
  region = "eu-west-2"

  default_tags {
    tags = {
      Environment = "datadog"
      Owner       = "operations"
      Project     = "risksmart-app"
      Region      = "eu-west-2"
      Account     = "prod"
      Terraform   = "true"
      CreatedBy   = "Terraform"
    }
  }
}
