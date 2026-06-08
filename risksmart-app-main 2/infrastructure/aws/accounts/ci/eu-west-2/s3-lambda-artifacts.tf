module "ext_api_lambda_artifacts" {
  source           = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/s3-code-artifacts?ref=s3-code-artifacts-v1.0.0"
  bucket_name      = "${var.bucket_name_external_api_lambda_artifacts}"
  read_principals  = [
    "arn:aws:iam::046657674620:root",
    "arn:aws:iam::640196420962:root",
    "arn:aws:iam::629531182017:root",
    "arn:aws:iam::826351825809:root"
  ]
  write_principals = [
    "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
    "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
    "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
    "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
  ]
}
