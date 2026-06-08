{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPullForAppAccounts",
      "Effect": "Allow",
      "Principal": {
        "AWS": ${app_account_ids_json}
      },
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ]
    },
    {
      "Sid": "AllowGithubRolesPushPull",
      "Effect": "Allow",
      "Principal": {
        "AWS": ${github_deploy_role_arns_json}
      },
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetAuthorizationToken"
      ]
    }
  ]
}
