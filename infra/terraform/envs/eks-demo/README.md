# eks-demo — on-demand EKS tier

The on-demand half of the hosting portfolio. `terraform apply` stands up a full
EKS cluster running the same multi-arch ECR image the always-on Hetzner box runs;
`terraform destroy` removes everything so the tier costs **$0 when idle**. The
build-up / tear-down cycle is the IaC demo.

## What it provisions

| Layer | Resource |
|-------|----------|
| Network | Public-subnet-only VPC, **no NAT gateway** (`vpc.tf`) |
| Cluster | EKS (arm64 **t4g.medium spot** managed node group) (`eks.tf`) |
| Ingress | AWS Load Balancer Controller → ALB, ACM HTTPS (`addons.tf`, `acm.tf`) |
| DNS | external-dns writes `eks.decentralizard.com` to Cloudflare (`addons.tf`) |
| Secrets | External Secrets Operator: SSM Parameter Store → K8s Secret (`addons.tf`, `secrets.tf`) |
| Observability | kube-prometheus-stack + Loki; app `/api/metrics` via ServiceMonitor (`addons.tf`) |
| App | Helm chart `../../../helm/decentralizard` (`app.tf`) |

Auth is **IRSA** throughout (`iam.tf`) — no static keys. The app pod's role grants
S3 media access via the AWS default credential chain (no `AWS_ACCESS_KEY_ID`).

## One-time setup

1. `cp terraform.tfvars.example terraform.tfvars` and fill `cloudflare_zone_id`
   + `cloudflare_api_token` (or `export TF_VAR_cloudflare_api_token=...`). `*.tfvars`
   is gitignored.
2. The ECR image must already exist (`decentralizard:latest`, pushed by GitLab CI).

## Bring up

```bash
terraform init
terraform apply
```

If the first apply errors on the kubernetes/helm provider because the cluster
endpoint isn't known yet, stage it once:

```bash
terraform apply -target=module.eks
terraform apply
```

### Seed the secrets (first apply only)

Terraform creates the SSM keys with a `REPLACE_ME` placeholder and never
overwrites them again. Set the real values once:

```bash
for k in DATABASE_URI PAYLOAD_SECRET CRON_SECRET SMTP_USER SMTP_PASS SMTP_PASSWORD NEXT_PUBLIC_SUPABASE_SERVICE_KEY; do
  aws ssm put-parameter --overwrite --type SecureString \
    --name "/decentralizard/eks/$k" --value "REAL_VALUE" --region eu-west-1
done
```

External Secrets resyncs hourly (or `kubectl annotate es ... force-sync=$(date +%s)`).

## Verify

```bash
$(terraform output -raw configure_kubectl)
kubectl get pods -A
curl -I https://eks.decentralizard.com          # app via ALB
terraform output grafana_portforward            # Grafana: admin / prom-operator
```

## Tear down

```bash
terraform destroy
```

The `depends_on` chain in `app.tf` / `addons.tf` deletes the Ingress (ALB
controller cleans up the ALB + ENIs) **before** the node group and VPC, so the
destroy doesn't hang on a `DependencyViolation`. If a destroy is interrupted and
an orphan ALB blocks subnet deletion, delete it in the EC2 console and re-run.

## Cost while up

EKS control plane $0.10/hr + 2× t4g.medium spot ≈ $0.026/hr + ALB ≈ $0.0225/hr ≈
**~$0.15/hr**. Idle after destroy: **$0**.
