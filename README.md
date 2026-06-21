# decentralizard

```
yarn dev
```

EKS = depth flex. "I run production Kubernetes." Proves: K8s, IRSA, Helm, ALB controller, external-dns,
ESO, Prom/Loki, Terraform modules, teardown choreography. Hard skills. You already built it.

- Step Functions / serverless = breadth + ops flex. "I build event-driven, scale-to-zero systems."
  Proves: Lambda, state machines, EventBridge, least-priv IAM, true serverless.

On your three literal criteria, serverless wins clean:

┌─────────────────────┬─────────────────────────────────────────┬───────────────────────────────────┐
│ Criterion │ EKS │ Step Funcs / serverless │
├─────────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ Scales simplest │ HPA + node group, you tune it │ Auto, to zero → thousands, AWS │
│ │ │ tunes it │
├─────────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ Cost-effective │ $0.10/hr control-plane floor (~$73/mo │ True $0 idle, no teardown needed. │
│ │ if left up) → $0 only after destroy │ Free tier covers a demo ~forever │
├─────────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ Commands up/down │ 2 (apply/destroy), +1 cold-start │ 1 (apply), 0 teardown │
│ │ -target dance, +secret seed first time │ │
├─────────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ Live when recruiter │ No — must spin up first (~15-20min) │ Yes, always on │
│ visits? │ │ │
├─────────────────────┼─────────────────────────────────────────┼───────────────────────────────────┤
│ Spin/tear time │ ~15-20min up, ~10-15min down │ ~2min, no down │
└─────────────────────┴─────────────────────────────────────────┴───────────────────────────────────┘

EKS control plane is fixed cost whether you run 0 pods or 100. That kill it as always-live demo. Can only
ever be "spin up on request."

Real recommendation: combine, don't choose

You already sunk the EKS work. Don't pick between — wrap EKS lifecycle in a Step Functions state machine.
Serverless orchestrator that provisions EKS on demand, holds it live N min, auto-tears-down.

## Why this is the strongest full-stack-AWS story:

- Orchestrator stays always-on at ~$0 → the live flex a visitor clicks.
- EKS drops to ZERO manual commands — button/API → EventBridge → Step Function → terraform apply → live →
  timed destroy. Your "wire into CI as manual eks-up/eks-down job" memory, but better.
- Shows both skillsets plus integration between them. Serverless control plane managing heavyweight K8s =
  exactly the senior signal.
- Step Functions is built for your actual pain: the cold-start -target two-step + teardown
  DependencyViolation ordering become explicit states with retry/catch. Encodes the choreography you
  already engineered by hand.
- The build-up/tear-down is itself the demo — visitor watches the state machine execution graph live.
  Visual, self-explanatory.

Narrative for the site: "Click → serverless provisions a full EKS cluster + observability live, runs it,
tears it to $0 automatically." That reads better than either piece alone.

## Decision

- Want one always-live cheap demo, minimal ops → pure serverless, skip EKS as live.
- Want best portfolio flex, reuse built work → Step Functions orchestrating EKS lifecycle. My pick.

State machine sketch:

TriggerEKSUp (EventBridge/API GW + button)
└─> TerraformInit (Lambda/CodeBuild)
└─> TargetApplyEKS (the -target module.eks step)
└─> FullApply (helm/k8s providers now resolvable)
└─> WaitForALBHealthy (poll)
└─> LiveTimer (Wait state, e.g. 30min)
└─> DestroyIngress (LB controller drains ALB+ENIs)
└─> DestroyAll (NG → VPC, ordered)
Catch on every step → DestroyAll (no orphan $$$)

## Spin up

#### 1. init (first time only)

```
terraform init
```

#### 2. create the 5 placeholder SSM keys (no cluster yet)

```
terraform apply -target=aws_ssm_parameter.app_secret
```

#### 3. seed real secret values from .env

```
set -a; source /Users/alex/Dev/decentralizard/.env; set +a
for k in DATABASE_URI PAYLOAD_SECRET CRON_SECRET SMTP_USER SMTP_PASSWORD; do
aws ssm put-parameter --overwrite --type SecureString \
 --name "/decentralizard/eks/$k" --value "${(P)k}" --region eu-west-1
done
```

#### 4. build the cluster (~15-20 min)

```
terraform apply
```

#### if it errors on unknown kube/helm endpoint, stage once:

```
terraform apply -target=module.eks && terraform apply
```

#### 5. verify

```
$(terraform output -raw configure_kubectl)
kubectl get pods -A
kubectl get externalsecret -n decentralizard / READY=True / SecretSynced
curl -I https://eks.decentralizard.com // HTTP/2 200
```

## Tear down

```
terraform destroy -auto-approve
aws eks list-clusters --region eu-west-1
```

#### [] = $0, nothing charging

### Notes:

- destroy deletes the SSM params too, so step 3 re-seeds every spin-up.
- After a fresh clone you also need terraform.tfvars (cloudflare zone id +
  token) — it's gitignored.
- Don't double-Ctrl+C a running apply/destroy; one is enough.
