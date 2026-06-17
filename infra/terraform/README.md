# Infrastructure (Terraform)

Two-tier hosting for decentralizard. This dir is the **always-on AWS baseline**
(private S3 media + CloudFront, ECR, IAM, remote state). The on-demand EKS demo
stack lands under `envs/demo/` later.

## Layout

- `bootstrap/` — one-time: creates the S3 state bucket + DynamoDB lock table (local state).
- `modules/media-cdn` — private S3 bucket + OAC + CloudFront + ACM (us-east-1).
- `modules/ecr` — container registry (multi-arch images).
- `modules/iam` — media-writer user (Oracle box → S3) + GitLab CI OIDC role.
- `envs/always-on` — wires the modules; S3 remote-state backend.

## Prereqs

- AWS CLI profile `default` (account 158871758094, eu-west-1).
- `export CLOUDFLARE_API_TOKEN=...` — token with `DNS:Edit` on the decentralizard.com zone.
- Cloudflare zone ID → set `cloudflare_zone_id` in `terraform.tfvars`.

## Run

```bash
# 1. one-time state backend (local state)
cd bootstrap
terraform init && terraform apply

# 2. always-on baseline (remote state)
cd ../envs/always-on
cp terraform.tfvars.example terraform.tfvars   # fill in cloudflare_zone_id
terraform init
terraform apply
```

## After apply

- Media-writer creds for the Oracle box:
  ```bash
  terraform output -raw media_writer_access_key_id
  terraform output -raw media_writer_secret_access_key
  ```
- One-time media migration (files land at bucket root, matching the Payload adapter):
  ```bash
  aws s3 sync ../../../public/media "s3://$(terraform output -raw media_bucket)/"
  ```
- Then set the app env: `S3_BUCKET=<media_bucket>`,
  `MEDIA_BASE_URL=https://cdn.decentralizard.com`, `AWS_REGION=eu-west-1`,
  plus the media-writer key/secret on the Oracle box.

## 2 Tier plan

Two-tier, why: EKS + observability always-on is ~$100/mo — absurd for a what is currently a few-visitor site. So split it:
Tier 1 is a cheap always-on box (Hetzner CAX11 ARM, ~€3.79) that serves the real, AdSense-monetized site
behind Cloudflare; Tier 2 is the AWS showcase (EKS, Lambda, Terraform, Grafana) that you terraform
apply/destroy on demand for interviews (~$0 idle). The destroy-and-recreate-from-code is the IaC flex.
Shared backends (Supabase DB, S3/CloudFront media, ECR image) sit under both. AdSense never sees the
expensive stack.

### Remaining phases:

- Phase 3 finish (CI activation) — commit the new files + prod-ca-2021.crt; create GitLab repo (mirror);
  set gitlab_project_path in tfvars + terraform apply (creates OIDC role); confirm pipeline builds
  multi-arch → ECR.
- Tier-1 deploy (Hetzner, rides with 3) — cloudflared tunnel, docker-compose pulling the ECR image,
  deploy.sh; s3 sync media from old VPS; flip S3_BUCKET + MEDIA_BASE_URL; point Cloudflare root → tunnel. →
  live on new stack, AdSense submittable.
- Phase 4 — Lambda pipeline — Payload publish hook → EventBridge → Step Functions composing Lambdas
  (OG-image, media-resize, CloudFront invalidate, SES newsletter). Live, ~$0.
- Phase 5 — EKS + Helm (on-demand) — TF cluster (public subnets, no NAT), Helm chart deploying same
  image, ALB via IRSA.
- Phase 6 — Observability — kube-prometheus-stack + Loki; app /metrics scraped; Grafana dashboards;
  postgres_exporter for Supabase.
- Phase 7 — Portfolio — architecture diagram, README, Loom of the spin-up, submit AdSense.
