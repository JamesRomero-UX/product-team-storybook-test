#### n8n Integration ####

resource "aws_ecr_repository" "n8n_integration" {
  name                 = var.repository_name_n8n
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = var.repository_name_n8n
  }
}

resource "aws_ecr_lifecycle_policy" "n8n_integration" {
  repository = aws_ecr_repository.n8n_integration.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images older than 90 days"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 90
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "n8n_integration" {
  repository = aws_ecr_repository.n8n_integration.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullForAppAccounts"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:root",
            "arn:aws:iam::640196420962:root",
            "arn:aws:iam::629531182017:root",
            "arn:aws:iam::826351825809:root"
          ]
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
      },
      {
        Sid    = "AllowGithubRolesPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
          ]
        }
        Action = [
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
  })
}

#### permit pdp v2 ####

resource "aws_ecr_repository" "permit_pdp" {
  name                 = var.repository_name_permit_pdp
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = var.repository_name_permit_pdp
  }
}

resource "aws_ecr_lifecycle_policy" "permit_pdp" {
  repository = aws_ecr_repository.permit_pdp.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Only keep 5 most recent images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "permit_pdp" {
  repository = aws_ecr_repository.permit_pdp.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullForAppAccounts"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:root",
            "arn:aws:iam::640196420962:root",
            "arn:aws:iam::629531182017:root",
            "arn:aws:iam::826351825809:root"
          ]
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
      },
      {
        Sid    = "AllowGithubRolesPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
          ]
        }
        Action = [
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
  })
}


#### trpc api ####

resource "aws_ecr_repository" "trpc_api" {
  name                 = var.repository_name_trpc_api
  image_tag_mutability = "IMMUTABLE_WITH_EXCLUSION"

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "dev-cloud-*"
  }

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "staging-*"
  }

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "prod-*"
  }
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = var.repository_name_trpc_api
  }
}

resource "aws_ecr_lifecycle_policy" "trpc_api" {
  repository = aws_ecr_repository.trpc_api.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep prod-tagged images (up to 5)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep staging-tagged images (up to 5)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["staging"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Keep dev-cloud-tagged images (up to 20)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["dev-cloud"]
          countType     = "imageCountMoreThan"
          countNumber   = 20
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 4
        description  = "Expire all remaining images after 1 day"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "trpc_api" {
  repository = aws_ecr_repository.trpc_api.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullForAppAccounts"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:root",
            "arn:aws:iam::640196420962:root",
            "arn:aws:iam::629531182017:root",
            "arn:aws:iam::826351825809:root"
          ]
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
      },
      {
        Sid    = "AllowGithubRolesPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
          ]
        }
        Action = [
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
  })
}

#### external api ####

resource "aws_ecr_repository" "external_api" {
  name                 = var.repository_name_external_api
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = var.repository_name_external_api
  }
}

resource "aws_ecr_lifecycle_policy" "external_api" {
  repository = aws_ecr_repository.external_api.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images older than 90 days"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 90
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "external_api" {
  repository = aws_ecr_repository.external_api.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullForAppAccounts"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:root",
            "arn:aws:iam::640196420962:root",
            "arn:aws:iam::629531182017:root",
            "arn:aws:iam::826351825809:root"
          ]
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
      },
      {
        Sid    = "AllowGithubRolesPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
          ]
        }
        Action = [
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
  })
}


#### hasura graphql engine ####

resource "aws_ecr_repository" "hasura_graphql_engine" {
  name                 = var.repository_name_hasura
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = var.repository_name_hasura
  }
}

resource "aws_ecr_lifecycle_policy" "hasura_graphql_engine" {
  repository = aws_ecr_repository.hasura_graphql_engine.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Only keep 5 most recent images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "hasura_graphql_engine" {
  repository = aws_ecr_repository.hasura_graphql_engine.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullForAppAccounts"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:root",
            "arn:aws:iam::640196420962:root",
            "arn:aws:iam::629531182017:root",
            "arn:aws:iam::826351825809:root"
          ]
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
      },
      {
        Sid    = "AllowGithubRolesPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
          ]
        }
        Action = [
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
  })
}

#### tenant deployer ####

resource "aws_ecr_repository" "tenant_deployer" {
  name                 = var.repository_name_tenant_deployer
  image_tag_mutability = "IMMUTABLE_WITH_EXCLUSION"

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "dev-cloud-*"
  }

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "staging-*"
  }

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "prod-*"
  }
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = var.repository_name_tenant_deployer
  }
}

resource "aws_ecr_lifecycle_policy" "tenant_deployer" {
  repository = aws_ecr_repository.tenant_deployer.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep prod-tagged images (up to 5)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep staging-tagged images (up to 5)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["staging"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Keep dev-cloud-tagged images (up to 20)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["dev-cloud"]
          countType     = "imageCountMoreThan"
          countNumber   = 20
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 4
        description  = "Expire all remaining images after 1 day"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "tenant_deployer" {
  repository = aws_ecr_repository.tenant_deployer.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullForAppAccounts"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:root",
            "arn:aws:iam::640196420962:root",
            "arn:aws:iam::629531182017:root",
            "arn:aws:iam::826351825809:root"
          ]
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
      },
      {
        Sid    = "AllowGithubRolesPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
          ]
        }
        Action = [
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
  })
}

#### integrations ####

module "integrations" {
  source = "../../../modules/ci-ecr-repository"

  name             = "risksmart/integrations"
  lifecycle_policy = "versioned_artifacts"
}


#### ai engine mcp server ####

resource "aws_ecr_repository" "mcp" {
  name                 = var.repository_name_mcp
  image_tag_mutability = "IMMUTABLE_WITH_EXCLUSION"

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "dev-cloud-*"
  }

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "staging-*"
  }

  image_tag_mutability_exclusion_filter {
    filter_type = "WILDCARD"
    filter      = "prod-*"
  }
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  lifecycle {
    prevent_destroy = true
  }
  tags = {
    Name = var.repository_name_mcp
  }
}

resource "aws_ecr_lifecycle_policy" "mcp" {
  repository = aws_ecr_repository.mcp.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep prod-tagged images (up to 5)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep staging-tagged images (up to 5)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["staging"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Keep dev-cloud-tagged images (up to 20)"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["dev-cloud"]
          countType     = "imageCountMoreThan"
          countNumber   = 20
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 4
        description  = "Expire all remaining images after 1 day"
        selection = {
          tagStatus   = "any"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_repository_policy" "mcp" {
  repository = aws_ecr_repository.mcp.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPullForAppAccounts"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:root",
            "arn:aws:iam::640196420962:root",
            "arn:aws:iam::629531182017:root",
            "arn:aws:iam::826351825809:root"
          ]
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
      },
      {
        Sid    = "AllowGithubRolesPushPull"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::046657674620:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::640196420962:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::629531182017:role/RiskSmart-GitHub-Deploy-Role",
            "arn:aws:iam::826351825809:role/RiskSmart-GitHub-Deploy-Role"
          ]
        }
        Action = [
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
  })
}