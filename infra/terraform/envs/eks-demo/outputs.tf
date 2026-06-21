output "cluster_name" {
  value = module.eks.cluster_name
}

output "app_url" {
  value = "https://${local.app_fqdn}"
}

output "ecr_repository" {
  value = local.ecr_repo
}

output "configure_kubectl" {
  description = "Run this to point kubectl/helm at the cluster"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.region} --profile ${var.profile}"
}

output "grafana_portforward" {
  description = "Then open http://localhost:3000 (admin / prom-operator)"
  value       = "kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3000:80"
}
