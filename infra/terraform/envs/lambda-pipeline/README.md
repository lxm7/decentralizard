# Lambda publish pipeline (Phase 4)

Serverless, always-on (~$0 idle) pipeline that runs when a Post is published.

```
Payload afterChange (publish transition)
  → POST /publish        (API Gateway HTTP API, shared-secret authorizer)
  → EventBridge          (direct PutEvents integration, no proxy Lambda)
  → rule: post.published
  → Step Functions (Standard)
        Parallel
          ├─ og-image       container Lambda (satori+resvg) → s3://media/og/posts/<slug>.png
          └─ indexnow-ping  zip Lambda → IndexNow (best-effort, never fails the run)
        → cloudfront-invalidate   zip Lambda → purge /og/posts/<slug>.png
```

State lives at `lambda-pipeline/terraform.tfstate`. Reads the media bucket +
CloudFront distribution id from the `always-on` remote state.

## Prereqs (one-time, before first apply)

1. **`always-on` re-applied** so it exports `cloudfront_distribution_id` +
   `media_bucket_arn` (added for this env):
   ```bash
   cd ../always-on && terraform apply
   ```

2. **Seed the two SSM SecureStrings** (read-only here, so they must exist first):
   ```bash
   aws ssm put-parameter --type SecureString --name /decentralizard/pipeline/api-secret \
     --value "$(openssl rand -hex 32)"
   aws ssm put-parameter --type SecureString --name /decentralizard/pipeline/indexnow-key \
     --value "$(openssl rand -hex 16)"
   ```
   - The **api-secret** value also goes on the Hetzner box as `PIPELINE_SECRET`
     (the hook sends it as the `Authorization` header).
   - The **indexnow-key** value must also be hosted on the site at
     `https://decentralizard.com/<key>.txt` (file body = the key) for IndexNow to
     verify. Add it as `public/<key>.txt` or a Next route.

3. **og-image image in ECR.** The Lambda is `package_type = Image`, so the image
   must exist before apply. The repo is created by this env, so first time:
   ```bash
   # apply just the repo, push, then full apply
   terraform apply -target=aws_ecr_repository.og_image
   # CI build-og-image job (or local buildx) pushes :latest, then:
   terraform apply
   ```
   Subsequent applies are a single `terraform apply` (image already present).

## Apply / destroy

```bash
cp terraform.tfvars.example terraform.tfvars   # optional, defaults are fine
terraform init
terraform apply        # see first-apply -target note above
# ...
terraform destroy
```

## After apply

- `terraform output publish_endpoint` → set on the Hetzner box as
  `PIPELINE_ENDPOINT`; set `PIPELINE_SECRET` to the api-secret value.
- Publish a post in Payload → watch the execution in the Step Functions console.

## App env vars (Hetzner / docker-compose)

| Var                | Value                                            |
| ------------------ | ------------------------------------------------ |
| `PIPELINE_ENDPOINT`| `terraform output -raw publish_endpoint`         |
| `PIPELINE_SECRET`  | the `/decentralizard/pipeline/api-secret` value  |

Both are optional — if unset, the hook no-ops (publishing still works).

## Deferred

SES newsletter step lands once the SES sandbox is lifted; subscribers in a
Supabase table. Until then the pipeline is OG card + IndexNow + invalidate.
