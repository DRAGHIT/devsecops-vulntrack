# VulnTrack — Live Demo Script

Eight minutes, in the order a grader expects. Each step states the command, the
screen to show, and the rubric module it satisfies. The matching slides are in
[`demo/vulntrack-capstone.pptx`](vulntrack-capstone.pptx) — 10 slides, one per
section.

| # | Show | Command / URL | Rubric |
| :-- | :--- | :--- | :--- |
| 1 | App running from one command | `docker compose up --build` | M1, M4 |
| 2 | Login as ADMIN, dashboard with data | `demo/seed.ps1` then http://localhost:3000 | M1 |
| 3 | CRUD over REST | Assets → New Asset, edit a vulnerability status | M1 |
| 4 | RBAC: read-only viewer gets 403 | `curl -i -u viewer:ViewerReadOnlyPassword!2026 -X POST http://localhost:8080/api/assets` | M1, M10 |
| 5 | Tests are the first gate | `cd backend; ./mvnw.cmd test` (and `npm test` in frontend) | M2 |
| 6 | Health + metrics | `curl http://localhost:8080/health` and `.../metrics` | M1, M9 |
| 7 | Pipeline goes green on push | commit → GitHub Actions run URL | M5 |
| 8 | SHA-tagged images in GHCR | Packages page for `vulntrack/backend` | M5 |
| 9 | Trivy blocks HIGH/CRITICAL | Security tab → code scanning alerts from Trivy | M6 |
| 10 | Cluster + 2 replicas per tier | `kubectl -n vulntrack get pods -o wide` | M8 |
| 11 | HPA reacting to load | `kubectl -n vulntrack get hpa -w` | M8 |
| 12 | App through the Ingress | http://vulntrack.local (or the ELB/NodePort address) | M8 |
| 13 | Targets UP + populated panel | Prometheus `/targets`, Grafana "VulnTrack" dashboard | M9 |

## The live "commit to production" segment (M10, 3 points)

This is the part the rubric explicitly asks you to perform in front of the
marker. It takes about 90 seconds of waiting, so narrate the four pipeline
stages while it runs: secret scan, tests, image build, GHCR publish.

```powershell
# 1. Change something visible
#    frontend/src/components/DashboardView.tsx -> edit the panel heading text
git add frontend/src/components/DashboardView.tsx
git commit -m "demo: visible dashboard change"
git push origin main

# 2. Watch the pipeline: Actions tab -> the run for that SHA
#    jobs: Security Scan | Test Backend | Test Frontend | Build, Scan & Publish

# 3. Deploy the image the pipeline just published (SHA comes from the commit)
$SHA = git rev-parse HEAD
helm upgrade --install vulntrack ./helm/vulntrack --namespace vulntrack `
  --set backend.image.tag=$SHA --set frontend.image.tag=$SHA

# 4. Show the rollout, then reload the browser through the Ingress
kubectl -n vulntrack rollout status deploy/vulntrack-frontend
kubectl -n vulntrack get pods -l app.kubernetes.io/component=frontend
```

## Talking points if something breaks

- **"Pods are Pending"** → the node group ran out of CPU. `kubectl describe pod`
  shows the FailedScheduling message; drop `backend.resources.requests` or scale
  the node group up.
- **"Prometheus target DOWN"** → the ServiceMonitor selector vs. Service labels;
  `kubectl -n vulntrack get svc --show-labels`.
- **"404 through the Ingress"** → the ingress-nginx addon is missing, or the
  `/etc/hosts` entry for `vulntrack.local` is not set.
- **"GHCR denies the push"** → the package is private and the workflow's
  `GITHUB_TOKEN` has no write access; Packages → Settings → Manage Actions
  access → add this repository.

## Before you present

- Run the whole script once end-to-end on the same machine you will demo from.
- `docker compose down -v` and `terraform destroy` afterwards — the EKS cluster
  bills by the hour.
- Keep `demo/evidence/` screenshots open in another tab as a fallback if the
  network dies during the session.
