module "github_deploy_role" {
  source = "git::git@github.com:risk-smart/risksmart-terraform-modules.git//modules/github-deploy-role?ref=github-deploy-role-v1.0.3"

  role_name = "RiskSmart-GitHub-Deploy-Role"

  github_repositories = [
    "repo:risk-smart/risksmart-app:*",
    "repo:risk-smart/risksmart-ai-engine:*",
    "repo:risk-smart/risksmart-terraform-modules:*"
  ]
}
