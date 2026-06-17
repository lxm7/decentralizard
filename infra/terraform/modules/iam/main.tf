variable "media_bucket_arn" {
  type = string
}

variable "ecr_repository_arn" {
  type = string
}

variable "gitlab_project_path" {
  type        = string
  default     = ""
  description = "e.g. lxm7/decentralizard — empty disables the CI OIDC role"
}

variable "tags" {
  type    = map(string)
  default = {}
}

# --- Hetzner box IAM user: S3 media writes + ECR image pulls ---
resource "aws_iam_user" "media_writer" {
  name = "decentralizard-media-writer"
  tags = var.tags
}

data "aws_iam_policy_document" "media_writer" {
  statement {
    actions   = ["s3:ListBucket"]
    resources = [var.media_bucket_arn]
  }
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
    ]
    resources = ["${var.media_bucket_arn}/*"]
  }
  statement {
    sid     = "EcrAuth"
    actions = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }
  statement {
    sid = "EcrPull"
    actions = [
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchCheckLayerAvailability",
    ]
    resources = [var.ecr_repository_arn]
  }
}

resource "aws_iam_user_policy" "media_writer" {
  name   = "media-rw"
  user   = aws_iam_user.media_writer.name
  policy = data.aws_iam_policy_document.media_writer.json
}

resource "aws_iam_access_key" "media_writer" {
  user = aws_iam_user.media_writer.name
}

# --- GitLab CI OIDC (no static keys) — enabled once gitlab_project_path is set ---
locals {
  gitlab_enabled = var.gitlab_project_path != ""
}

resource "aws_iam_openid_connect_provider" "gitlab" {
  count = local.gitlab_enabled ? 1 : 0

  url            = "https://gitlab.com"
  client_id_list = ["https://gitlab.com"]
  # AWS validates the IdP via its trust store; thumbprint is required by the API
  # but no longer security-critical for well-known providers.
  thumbprint_list = ["b3dd7606d2b5a8b4a13771dbecc9ee1cecafa38a"]
  tags            = var.tags
}

data "aws_iam_policy_document" "gitlab_assume" {
  count = local.gitlab_enabled ? 1 : 0

  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.gitlab[0].arn]
    }

    condition {
      test     = "StringEquals"
      variable = "gitlab.com:aud"
      values   = ["https://gitlab.com"]
    }

    condition {
      test     = "StringLike"
      variable = "gitlab.com:sub"
      values   = ["project_path:${var.gitlab_project_path}:ref_type:branch:ref:*"]
    }
  }
}

resource "aws_iam_role" "gitlab_ci" {
  count              = local.gitlab_enabled ? 1 : 0
  name               = "decentralizard-gitlab-ci"
  assume_role_policy = data.aws_iam_policy_document.gitlab_assume[0].json
  tags               = var.tags
}

data "aws_iam_policy_document" "gitlab_ci" {
  count = local.gitlab_enabled ? 1 : 0

  statement {
    sid       = "EcrAuth"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }
  statement {
    sid = "EcrPush"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
    resources = [var.ecr_repository_arn]
  }
}

resource "aws_iam_role_policy" "gitlab_ci" {
  count  = local.gitlab_enabled ? 1 : 0
  name   = "ecr-push"
  role   = aws_iam_role.gitlab_ci[0].id
  policy = data.aws_iam_policy_document.gitlab_ci[0].json
}

# --- Outputs ---
output "media_writer_access_key_id" {
  value = aws_iam_access_key.media_writer.id
}

output "media_writer_secret_access_key" {
  value     = aws_iam_access_key.media_writer.secret
  sensitive = true
}

output "gitlab_ci_role_arn" {
  value = local.gitlab_enabled ? aws_iam_role.gitlab_ci[0].arn : null
}
