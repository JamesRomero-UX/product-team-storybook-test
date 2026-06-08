variable "aws_accounts" {
  description = "Map of AWS accounts to integrate with Datadog"
  type = map(object({
    account_id   = string
    account_name = string
    enabled      = bool
  }))
  default = {
    ci = {
      account_id   = "437474201705"
      account_name = "ci"
      enabled      = true
    }
    dev-cloud = {
      account_id   = "640196420962"
      account_name = "dev-cloud"
      enabled      = true
    }
    staging = {
      account_id   = "629531182017"
      account_name = "staging"
      enabled      = true
    }
    prod = {
      account_id   = "826351825809"
      account_name = "prod"
      enabled      = true
    }
    tech-admin = {
      account_id   = "046657674620"
      account_name = "tech-admin"
      enabled      = true
    }
  }
}
