# =============================================================================
# Cluster addons installed via Helm. Each depends on the node group so pods can
# actually schedule. Teardown order is the reverse of creation: app.tf's Ingress
# is destroyed first (the ALB controller below cleans up the real ALB + ENIs),
# THEN these controllers, THEN the cluster/VPC — which is what lets a single
# `terraform destroy` finish without DependencyViolation on the subnets.
# =============================================================================

# --- AWS Load Balancer Controller (turns the app Ingress into an ALB) ---
resource "helm_release" "aws_lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = "~> 1.8"
  namespace  = "kube-system"

  values = [yamlencode({
    clusterName = local.name
    region      = var.region
    vpcId       = module.vpc.vpc_id
    serviceAccount = {
      create = true
      name   = "aws-load-balancer-controller"
      annotations = {
        "eks.amazonaws.com/role-arn" = module.irsa_lb_controller.iam_role_arn
      }
    }
  })]

  depends_on = [module.eks]
}

# --- External Secrets Operator (SSM -> K8s Secret) ---
resource "helm_release" "external_secrets" {
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  version          = "~> 0.16" # 0.16 first ships external-secrets.io/v1 (alongside v1beta1) the app chart requires
  namespace        = "external-secrets"
  create_namespace = true

  values = [yamlencode({
    installCRDs = true
    serviceAccount = {
      create = true
      name   = "external-secrets"
      annotations = {
        "eks.amazonaws.com/role-arn" = module.irsa_external_secrets.iam_role_arn
      }
    }
  })]

  depends_on = [module.eks]
}

# --- external-dns: manages the eks.decentralizard.com record in Cloudflare ---
resource "kubernetes_namespace" "external_dns" {
  metadata { name = "external-dns" }
  depends_on = [module.eks]
}

resource "kubernetes_secret" "cloudflare_token" {
  metadata {
    name      = "cloudflare-api-token"
    namespace = kubernetes_namespace.external_dns.metadata[0].name
  }
  data = {
    apiToken = var.cloudflare_api_token
  }
  type = "Opaque"
}

resource "helm_release" "external_dns" {
  name       = "external-dns"
  repository = "https://kubernetes-sigs.github.io/external-dns"
  chart      = "external-dns"
  version    = "~> 1.15"
  namespace  = kubernetes_namespace.external_dns.metadata[0].name

  values = [yamlencode({
    provider      = { name = "cloudflare" }
    sources       = ["ingress"]
    policy        = "sync" # delete records when the Ingress goes away (clean teardown)
    registry      = "txt"
    txtOwnerId    = "eks-demo"
    domainFilters = [var.root_domain]
    env = [{
      name = "CF_API_TOKEN"
      valueFrom = {
        secretKeyRef = {
          name = kubernetes_secret.cloudflare_token.metadata[0].name
          key  = "apiToken"
        }
      }
    }]
  })]

  depends_on = [kubernetes_secret.cloudflare_token]
}

# --- Observability: kube-prometheus-stack + Loki in one namespace ---
resource "kubernetes_namespace" "monitoring" {
  metadata { name = "monitoring" }
  depends_on = [module.eks]
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "~> 65.0"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  values = [yamlencode({
    prometheus = {
      prometheusSpec = {
        # Discover ServiceMonitors across all namespaces, not just Helm-labelled ones
        serviceMonitorSelectorNilUsesHelmValues = false
        podMonitorSelectorNilUsesHelmValues     = false
      }
    }
    grafana = {
      # Default login admin / prom-operator (see README). Loki wired as a datasource.
      additionalDataSources = [{
        name   = "Loki"
        type   = "loki"
        url    = "http://loki.monitoring:3100"
        access = "proxy"
      }]
    }
  })]

  depends_on = [kubernetes_namespace.monitoring]
}

resource "helm_release" "loki" {
  name       = "loki"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki-stack"
  version    = "~> 2.10"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  values = [yamlencode({
    loki     = { enabled = true }
    promtail = { enabled = true }
    grafana  = { enabled = false } # reuse the kube-prometheus-stack Grafana
  })]

  depends_on = [kubernetes_namespace.monitoring]
}
