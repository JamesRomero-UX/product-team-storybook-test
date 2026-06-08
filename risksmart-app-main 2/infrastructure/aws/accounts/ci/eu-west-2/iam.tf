# dd-iac-scan disable=09c35abf-5852-4622-ac7a-b987b331232e
# Not vulnerable to confused deputy attack as the role is only assumable by specific roles in trusted accounts

resource "aws_iam_role" "cross_account_role" {
  name = "OpenTofuCrossAccountAccessRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",                                                                    // Tech Admin
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",                                                                    // Dev Cloud
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",                                                                    // Staging
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role",                                                                    // Production
            "arn:aws:iam::629531182017:role/aws-reserved/sso.amazonaws.com/eu-west-2/AWSReservedSSO_AWSAdministratorAccess_af3331eaf9d407fd", // Staging SSO (Admin)
            "arn:aws:iam::629531182017:role/aws-reserved/sso.amazonaws.com/eu-west-2/AWSReservedSSO_AWSPowerUserAccess_ff11807bd9c98e73",     // Staging SSO (PowerUser)
            "arn:aws:iam::826351825809:role/aws-reserved/sso.amazonaws.com/eu-west-2/AWSReservedSSO_AWSAdministratorAccess_effcfa00332f6cc5", // Production SSO (Admin only)
            "arn:aws:iam::046657674620:role/aws-reserved/sso.amazonaws.com/eu-west-2/AWSReservedSSO_AWSAdministratorAccess_39dd4570ef882fd6", // Tech Admin SSO (Admin)
            "arn:aws:iam::046657674620:role/aws-reserved/sso.amazonaws.com/eu-west-2/AWSReservedSSO_AWSPowerUserAccess_439c205a245dd362",     // Tech Admin SSO (PowerUser)
            "arn:aws:iam::640196420962:role/aws-reserved/sso.amazonaws.com/eu-west-2/AWSReservedSSO_AWSAdministratorAccess_02159dbe7f94cf96", // Dev Cloud SSO (Admin)
            "arn:aws:iam::640196420962:role/aws-reserved/sso.amazonaws.com/eu-west-2/AWSReservedSSO_AWSPowerUserAccess_b5ba54370eca3966"      // Dev Cloud SSO (PowerUser)
          ]
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "cross_account_policy" {
  name = "OpenTofuCrossAccountAccessPolicy"
  role = aws_iam_role.cross_account_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:DescribeRepositories",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "ecr:ListTagsForResource"
        ],
        Resource = [
          "arn:aws:ecr:eu-west-2:${var.ci_account_id}:repository/risksmart/chat-api",
          "arn:aws:ecr:eu-west-2:${var.ci_account_id}:repository/risksmart/workflow-api",
          "arn:aws:ecr:eu-west-2:${var.ci_account_id}:repository/risksmart/mcp"
        ]
      }
    ]
  })
}
