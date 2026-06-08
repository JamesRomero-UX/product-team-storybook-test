locals {
  enable_pitr     = var.ext_api_enable_backup
  prevent_destroy = var.ext_api_prevent_destroy
  enable_backups  = var.ext_api_enable_backup
  gsi1_name       = "gsi_1"
  gsi1_pk_name    = "gsi_1_pk"
  gsi1_sk_name    = "gsi_1_sk"
}
