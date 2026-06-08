resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC for Sprinters GitHub Runners. Other accounts that want to run runners in ${local.region} need this VPC to live in the CI account"
  }
}
