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

### For EKS Tier

##### Apply secrets if not already:

```bash
for k in DATABASE_URI PAYLOAD_SECRET CRON_SECRET SMTP_USER SMTP_PASSWORD;
  do
    aws ssm put-parameter --overwrite --type SecureString --name "/decentralizard/eks/$k" --value "${(P)k}" --region eu-west-1
  done
```

Same as above but additional options if it fails / dangling orphan

```bash
aws eks update-kubeconfig --name decentralizard-eks --region eu-west-1
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

## Restart

```bash
kubectl rollout restart deployment -n decentralizard
```

## Terraform Destroy

```bash
export CLOUDFLARE_API_TOKEN="cfat_xxx4b8"
```

Delete in-cluster LB sources first so the controller cleans up its own AWS resources

```bash
kubectl delete ingress,svc --all -A --timeout=120s
helm uninstall app -n <ns>

Find<ns>:

grep -n 'helm_release\|namespace' app.tf addons.tf in envs/eks-demo/

then:
terraform destroy -auto-approve
```

### Other Helm commands for build / tear downs:

```bash
First: point kubectl/helm at cluster

Needed before any helm/kubectl cmd (kubeconfig gone after
destroy):
aws eks update-kubeconfig --name decentralizard-eks --region
eu-west-1

Build-up / inspect commands used

helm list -A                              # all releases, all
namespaces
helm list -n external-secrets             # one namespace
helm status decentralizard -n decentralizard
helm get values decentralizard -n decentralizard   # rendered
values
kubectl get pods -A                       # what's running
kubectl get ingress,svc -A                # LB sources
(ALB/NLB origins)
kubectl get crd externalsecrets.external-secrets.io   # CRD
ready before app
kubectl get externalsecrets -A            # secret sync status
CRD check mattered — app release failed before (no matches for
kind aws-parameterstore) cuz external-secrets CRDs not ready.
Order: external-secrets → CRDs ready → app.

Tear-down commands (pre-terraform destroy)

Stops the orphan-ALB problem you just hit. Delete LB sources
first so controller cleans its own AWS junk:
kubectl delete ingress,svc --all -A --timeout=120s    # frees
ALB/NLB + EIPs
helm uninstall decentralizard -n decentralizard
helm uninstall loki kube-prometheus-stack -n monitoring
helm uninstall external-dns -n external-dns
helm uninstall external-secrets -n external-secrets
helm uninstall aws-load-balancer-controller -n kube-system   #
LAST — it does the cleanup
Then terraform destroy.
```

#### Then verify nothing's billing (eu-west-1) — these four are the only chargeable things:

```bash
aws eks list-clusters --region eu-west-1 --query clusters
aws ec2 describe-instances --region eu-west-1 --filters Name=instance-state-name,Values=running --query 'Reservations[].Instances[].InstanceId'
aws elbv2 describe-load-balancers --region eu-west-1 --query 'LoadBalancers[].LoadBalancerName'
aws ec2 describe-volumes --region eu-west-1 --filters Name=status,Values=available --query 'Volumes[].VolumeId'
```

If destroy errors with DependencyViolation (orphan ALB holding the subnet): the AWS LB Controller didn't
finish cleaning its ALB before TF tried to delete the VPC. Fix:

```bash
aws elbv2 describe-load-balancers --region eu-west-1 --query 'LoadBalancers[].LoadBalancerArn'
aws elbv2 delete-load-balancer --region eu-west-1 --load-balancer-arn <arn>
terraform destroy -auto-approve # re-run, now subnets free up
```

If describe-volumes lists leftover EBS (Prometheus/Loki PVCs that didn't cascade): delete them so they
don't bill:

```bash
aws ec2 delete-volume --region eu-west-1 --volume-id <vol-id>
```

Check

```bash
aws eks list-clusters --region eu-west-1
```

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
- Phase 8 (optional) — Step Functions orchestrating the EKS lifecycle: button/EventBridge → state
  machine runs terraform up (target-apply → full-apply), holds live N min, auto-destroys (ordered,
  catch→destroy on any failure). Serverless control plane driving the heavyweight K8s demo to $0.
  Encodes the cold-start -target two-step + teardown ordering as explicit states. Niche; do only after 4-7.

### Notes on Claoudflare Tunnels:

#### What tunneling is here

Normal way serve website: box has public IP, open inbound ports 80/443 to
whole internet, DNS A record → box IP, you run nginx + Let's Encrypt certs.
Box exposed. Scanned, attacked, DDoS hits origin direct. You babysit cert
renewal + firewall.

Cloudflare Tunnel flips it. cloudflared daemon runs on your box (in your
compose). It dials outbound to Cloudflare edge — those 4 QUIC connections to
fra03/fra07/fra21 you saw in logs. Persistent, encrypted, stays open.

Traffic flow:
user → Cloudflare edge (anycast) → [existing outbound tunnel] → cloudflared →
app:3000 (docker net)

Box opens zero inbound ports. No A record to your IP. That's why dig
decentralizard.com showed 104.21.x/172.67.x (CF proxy IPs), never your box
91.107.211.52. Origin IP hidden.

Why this = best-practice secure infra

- Outbound-only = near-zero attack surface. Firewall can DROP all inbound.
  Can't port-scan, can't DDoS, can't hit an origin you can't find.
- No origin-IP leak bypass. Classic CF-proxy-via-DNS flaw: people orange-cloud
  DNS but leave box IP reachable; attacker finds real IP, hits it direct, skips
  CF entirely. Tunnel makes origin unreachable except through tunnel. Bypass
  impossible.
- TLS handled at edge. CF owns the cert, auto-renew, TLS 1.3/QUIC. No certbot,
  no port 443 cert plumbing on box.
- Edge stack free in front of $4/mo box: DDoS protection, WAF, caching, global
  anycast, analytics.
- Zero-trust shaped. Origin trusts nothing inbound. Can bolt Cloudflare Access
  (SSO auth) on admin routes with no app code.

Why over alternatives

- vs nginx + Let's Encrypt + open 443 — you own cert renewal, firewall, DDoS
  exposure, IP-leak risk. Tunnel deletes all of it.
- vs AWS ALB/ELB — hourly cost, cloud lock-in, still need security groups.
  Overkill for one small box. Against your cost-dodge plan.
- vs Tailscale/WireGuard — mesh for private/admin access, not serving public
  anonymous web traffic. Wrong tool for public ingress.
- vs ngrok — dev/ephemeral toy. CF tunnel = production, free tier, native to
  your existing CF zone + WAF + cache.

Why you couldn't find "step 2" (the app:3000 field)

Real reasons, not you being dumb:

1. Two management modes. Tunnel either locally-managed (config.yml on box, no
   UI for ingress) or remotely-managed (dashboard owns ingress → "Public
   Hostnames" UI). The add-hostname → http://app:3000 field only exists in remote
   mode, and only after cloudflared connects advertising allow_remote_config
   (that feature flag was in your connector). Until that handshake, tab's
   absent/empty.
2. Dashboard moved it. Old "Tunnels" page → now Zero Trust > Networks >
   Connectors. Last session bounced around hunting it for that reason.
3. The killer: two tunnels. You had decentralizard AND work-you-cunt. The UI
   showed you one connector's hostnames while you thought you edited the other.
   The app:3000 setting got saved — but the apex hostname ended up attached to
   work-you-cunt with a typo (app:300), and DNS CNAME pointed there. So "step 2"
   was done — on the wrong tunnel. That mismatch = the entire 502 saga.

```

```
