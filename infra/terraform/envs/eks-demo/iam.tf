data "aws_caller_identity" "current" {}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  media_bucket = "decentralizard-media-${local.account_id}"
  ssm_arn_glob = "arn:aws:ssm:${var.region}:${local.account_id}:parameter${var.ssm_prefix}/*"
}

# --- IRSA: AWS Load Balancer Controller (provisions the ALB for the Ingress) ---
module "irsa_lb_controller" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name                              = "${local.name}-alb-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }

  tags = local.tags
}

# --- IRSA: External Secrets Operator controller (reads scoped SSM params) ---
module "irsa_external_secrets" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name                           = "${local.name}-external-secrets"
  attach_external_secrets_policy      = true
  external_secrets_ssm_parameter_arns = [local.ssm_arn_glob]

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["external-secrets:external-secrets"]
    }
  }

  tags = local.tags
}

# --- IRSA: the app pod itself (S3 media read/write via the default cred chain) ---
data "aws_iam_policy_document" "app_s3" {
  statement {
    sid       = "ListMediaBucket"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${local.media_bucket}"]
  }
  statement {
    sid = "MediaObjects"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
    ]
    resources = ["arn:aws:s3:::${local.media_bucket}/*"]
  }
}

resource "aws_iam_policy" "app_s3" {
  name   = "${local.name}-app-s3"
  policy = data.aws_iam_policy_document.app_s3.json
  tags   = local.tags
}

module "irsa_app" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${local.name}-app"
  role_policy_arns = {
    s3 = aws_iam_policy.app_s3.arn
  }

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["decentralizard:decentralizard"]
    }
  }

  tags = local.tags
}
