locals {
  ecr_repo = "${local.account_id}.dkr.ecr.${var.region}.amazonaws.com/decentralizard"
}

# The app itself. depends_on every controller so that on `terraform destroy`
# this release (Ingress, ExternalSecret, ServiceMonitor) is torn down FIRST,
# while the controllers that own the external resources are still running.
resource "helm_release" "app" {
  name             = "decentralizard"
  chart            = "${path.module}/../../../helm/decentralizard"
  namespace        = "decentralizard"
  create_namespace = true

  values = [yamlencode({
    replicaCount = var.node_desired_size

    image = {
      repository = local.ecr_repo
      tag        = var.image_tag
    }

    host              = local.app_fqdn
    acmCertificateArn = aws_acm_certificate_validation.app.certificate_arn

    serviceAccount = {
      name    = "decentralizard"
      roleArn = module.irsa_app.iam_role_arn
    }

    # Non-sensitive runtime config (sensitive values come from External Secrets).
    env = {
      NODE_ENV               = "production"
      AWS_REGION             = var.region
      S3_BUCKET              = local.media_bucket
      MEDIA_BASE_URL         = "https://cdn.${var.root_domain}"
      NEXT_PUBLIC_SERVER_URL = "https://${local.app_fqdn}"
      NEXT_PUBLIC_SITE_URL   = "https://${local.app_fqdn}"
      CERT_CA                = "certs/prod-ca-2021.crt"
      SMTP_HOST              = "email-smtp.${var.region}.amazonaws.com"
      SMTP_PORT              = "587"
      SMTP_SECURE            = "false"
      SMTP_FROM_EMAIL        = "contact@${var.root_domain}"
    }

    externalSecrets = {
      enabled            = true
      clusterSecretStore = "aws-parameterstore"
      region             = var.region
      ssmPrefix          = var.ssm_prefix
      keys               = var.secret_env_keys
    }

    serviceMonitor = { enabled = true }
  })]

  depends_on = [
    helm_release.aws_lb_controller,
    helm_release.external_secrets,
    helm_release.external_dns,
    helm_release.kube_prometheus_stack,
    aws_acm_certificate_validation.app,
    aws_ssm_parameter.app_secret,
  ]
}
