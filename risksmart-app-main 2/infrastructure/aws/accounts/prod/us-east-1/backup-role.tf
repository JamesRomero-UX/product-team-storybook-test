module "cross_account_backup_role" {
  source    = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/aws-backup-infra?ref=aws-backup-infra-v1.0.0"
  role_name = "${local.account_name}-cross-account-backup-role"
}
