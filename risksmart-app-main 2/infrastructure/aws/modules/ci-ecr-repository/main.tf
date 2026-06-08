resource "aws_ecr_repository" "this" {
  name                 = var.name
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
    Name = var.name
  }
}

resource "aws_ecr_lifecycle_policy" "this" {
  repository = aws_ecr_repository.this.name
  # Load lifecycle policy JSON from the module's lifecycle/ directory.
  # Valid values for `var.lifecycle_policy` are defined in variables.tf.
  policy = file("${path.module}/lifecycle/${var.lifecycle_policy}.json")
}

resource "aws_ecr_repository_policy" "this" {
  repository = aws_ecr_repository.this.name
  policy = templatefile("${path.module}/policies/repository_policy.json.tpl", {
    app_account_ids_json         = jsonencode([for id in var.app_account_ids : "arn:aws:iam::${id}:root"])
    github_deploy_role_arns_json = jsonencode(var.github_deploy_role_arns)
  })
}
