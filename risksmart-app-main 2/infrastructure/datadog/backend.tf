terraform {
  backend "s3" {
    bucket       = "prod-eu-west-2-risksmart-terraform-state"
    key          = "terraform/datadog/terraform.tfstate"
    region       = "eu-west-2"
    use_lockfile = true
    encrypt      = true
  }
}
