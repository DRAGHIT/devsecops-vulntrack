# Observability Stack (Prometheus + Grafana)

Rubric M9 needs four pieces of evidence: `/metrics` output, Prometheus targets
**UP**, Grafana reachable, and a populated panel. Every command below is ordered
so you can screenshot each step.

## Files in this directory

| File | Purpose |
| :--- | :--- |
| `kube-prometheus-stack-values.yaml` | Helm values that install Prometheus + Grafana sized for a demo cluster |
| `servicemonitor.yaml` | Tells Prometheus to scrape the VulnTrack backend on `/metrics` |
| `prometheus/prometheus-rule.yaml` | The three alerts as a `PrometheusRule` CRD (loaded by the stack) |
| `prometheus/alert-rules.yaml` | The same rules in plain Prometheus format for a standalone server |
| `prometheus/prometheus-config.yaml` | Reference config for running Prometheus outside Kubernetes |
| `grafana/dashboard-vulntrack.json` | Dashboard: JVM heap, P95 latency, 5xx ratio, pod restarts |

## 1. Confirm the backend exposes metrics

```powershell
kubectl -n vulntrack port-forward deploy/vulntrack-backend 8080:8080
curl http://localhost:8080/metrics        # Prometheus text format, jvm_* + http_server_requests_*
curl http://localhost:8080/health         # {"status":"UP", ...}
```

Inside the cluster the same path is scraped, so this also works:

```powershell
kubectl -n vulntrack exec deploy/vulntrack-backend -- wget -qO- http://localhost:8080/metrics | Select-String -First 5 "^jvm_"
```

## 2. Install the stack

```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

helm upgrade --install kps prometheus-community/kube-prometheus-stack `
  --namespace monitoring `
  --values monitoring/kube-prometheus-stack-values.yaml
```

`kps` is the release name the values file expects — the Grafana datasource URL
is built from it, so keep the name if you copy these commands.

## 3. Scrape VulnTrack and load the dashboard

```powershell
kubectl apply -f monitoring/servicemonitor.yaml
kubectl apply -f monitoring/prometheus/prometheus-rule.yaml

kubectl -n monitoring create configmap vulntrack-grafana-dashboard `
  --from-file=vulntrack-telemetry.json=monitoring/grafana/dashboard-vulntrack.json `
  --dry-run=client -o yaml | kubectl apply -f -
```

The Grafana sidecar picks the ConfigMap up within ~30 seconds (label
`grafana_dashboard: "1"`), so no manual import is needed.

## 4. Open the UIs

```powershell
kubectl -n monitoring port-forward svc/kps-kube-prometheus-stack-prometheus 9090:9090
kubectl -n monitoring port-forward svc/kps-grafana 3000:80
```

- Prometheus: <http://localhost:9090/targets> → `serviceMonitor/vulntrack-backend` must read **UP**
- Grafana: <http://localhost:3000> → login `admin` / `vulntrack_demo_admin`,
  then **Dashboards → VulnTrack — Application & Cluster Health Dashboard**

On kind/Minikube you can also use the NodePort directly:
`http://<node-ip>:30300` for Grafana.

## 5. Generate traffic before you screenshot

Prometheus only has series once something has been scraped, so drive the API for
a minute:

```powershell
1..60 | ForEach-Object {
  Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/assets -Headers @{Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("admin:AdminSecurePassword!2026"))} | Out-Null
  Start-Sleep -Milliseconds 500
}
```

## Notes

- `alertmanager.enabled: false` and the disabled kube-system components keep the
  stack under ~1 GiB, which a single-node kind cluster can actually hold.
- If a target is `DOWN`, check the ServiceMonitor label selector against
  `kubectl -n vulntrack get svc vulntrack-backend --show-labels`.
- `hpa.yaml` needs `metrics-server` installed (`kind` exposes it as an addon;
  EKS ships it as a managed add-on you can enable in the console).
