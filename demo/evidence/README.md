# Submission Evidence

Every screenshot the rubric asks for, with the command that produces it. Save the
captures into this folder using the file names below, then attach them to the
submission form.

| Module | File to save | Command / place |
| :--- | :--- | :--- |
| M1 | `01-app-running.png` | Browser at http://localhost:3000 with the dashboard populated |
| M2 | `02-tests-passing.png` | `cd backend; ./mvnw.cmd test` (then `cd frontend; npm test`) |
| M3 | `03-commit-history.png` | GitHub → Commits, at least 10 meaningful messages |
| M4 | `04-compose-up.png` | `docker compose up --build` terminal, all three services |
| M4 | `05-compose-browser.png` | Browser at http://localhost:3000 served by the NGINX container |
| M5 | `06-pipeline-green.png` | GitHub Actions run URL, all jobs green |
| M5 | `07-ghcr-sha-tags.png` | GitHub → Packages → `vulntrack/backend`, tags are commit SHAs |
| M6 | `08-trivy-output.png` | Actions job → "Trivy Gate" step output (clean or findings) |
| M7 | `09-terraform-plan.png` | `terraform plan` in `terraform/` |
| M7 | `10-aws-console.png` | VPC (2 public subnets) + EKS cluster in the AWS console |
| M7 | `11-terraform-destroy.png` | `terraform destroy` completion |
| M8 | `12-kubectl-pods.png` | `kubectl -n vulntrack get pods -o wide` (all Running, 2+2) |
| M8 | `13-kubectl-svc.png` | `kubectl -n vulntrack get svc` |
| M8 | `14-helm-list.png` | `helm list -n vulntrack` |
| M8 | `15-ingress-browser.png` | App loaded through the Ingress host / load-balancer address |
| M9 | `16-metrics-curl.png` | `curl http://localhost:8080/metrics` |
| M9 | `17-prometheus-targets.png` | Prometheus http://localhost:9090/targets → `vulntrack-backend` UP |
| M9 | `18-grafana-panel.png` | Grafana → VulnTrack dashboard with live series |
| M10 | `demo-walkthrough.mp4` | Screen recording of `demo/DEMO_SCRIPT.md` (own commit) |

## Capture tips

- Terminal shots should show the command line as well as the result, so the
  marker can tell it was actually executed.
- For the Grafana panel, generate traffic first (see step 5 of
  [../monitoring/README.md](../monitoring/README.md)) — an empty graph reads as a
  broken scrape.
- Blur or crop anything that looks like a real credential. The demo `admin` /
  `viewer` passwords in this repository are throwaway values, but AWS keys,
  GitHub tokens, and cookies are not acceptable in a public submission.
