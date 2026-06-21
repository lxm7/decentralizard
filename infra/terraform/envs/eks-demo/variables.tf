variable "region" {
  type    = string
  default = "eu-west-1"
}

variable "profile" {
  type    = string
  default = "default"
}

variable "root_domain" {
  type    = string
  default = "decentralizard.com"
}

variable "app_subdomain" {
  type        = string
  default     = "eks"
  description = "Public host for the on-demand EKS app, e.g. eks.decentralizard.com"
}

variable "cluster_version" {
  type    = string
  default = "1.31"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "node_instance_types" {
  type        = list(string)
  default     = ["t4g.medium"]
  description = "arm64 Graviton — matches the multi-arch ECR image"
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "ECR tag the app chart deploys"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for decentralizard.com"
}

variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "Scoped CF token (Zone:DNS:Edit) consumed by external-dns to manage the eks. record"
}

variable "ssm_prefix" {
  type        = string
  default     = "/decentralizard/eks"
  description = "SSM Parameter Store path holding the app's runtime secrets"
}

variable "secret_env_keys" {
  type = list(string)
  default = [
    "DATABASE_URI",
    "PAYLOAD_SECRET",
    "CRON_SECRET",
    "SMTP_USER",
    "SMTP_PASSWORD",
  ]
  description = "Keys synced from SSM -> K8s Secret via External Secrets. Seed values manually after first apply."
}
