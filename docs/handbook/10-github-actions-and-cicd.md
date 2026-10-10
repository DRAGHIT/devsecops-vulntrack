# Chapter 10: GitHub Actions & CI/CD Pipeline Automation

Continuous Integration and Continuous Deployment (CI/CD) automates the validation, packaging, and delivery of software upon every code commit.

---

## 1. CI/CD Lifecycle in VulnTrack

```mermaid
flowchart LR
    Commit([Git Commit & Push]) --> Job1[1. Secret Scan<br/>GitLeaks]
    Commit --> Job2[2. Backend Tests<br/>JUnit 5 & MockMvc]
    Commit --> Job3[3. Frontend Tests<br/>Vitest & Typecheck]
    
    Job1 --> Gate{Quality Gate<br/>All Passed?}
    Job2 --> Gate
    Job3 --> Gate

    Gate -->|Yes| Job4[4. Container Build<br/>Docker Buildx]
    Gate -->|No| Fail([Pipeline Fails & Alerts])

    Job4 --> Job5[5. Security Scan<br/>Trivy Scanner]
    Job5 --> Job6[6. Publish Images<br/>GitHub Packages GHCR]
```

---

## 2. Principle of Least Privilege in CI/CD

Workflows should only have the minimal GitHub permissions needed to complete their task:

```yaml
permissions:
  contents: read          # Read repository code
  packages: write         # Publish container images to GHCR
  security-events: write  # Upload SARIF vulnerability reports to Security tab
```

Never grant administrative write permissions to all scopes if only package publishing is required.

---

## 3. Dependency Caching for Fast Pipelines

In cloud runners, downloading dependencies from scratch on every run wastes minutes. In `.github/workflows/ci.yml`, we leverage caching:
- For Java: `cache: maven` in `actions/setup-java@v4` reuses cached `~/.m2/repository` jars.
- For Node: `cache: npm` in `actions/setup-node@v4` caches `~/.npm` packages.

This reduces pipeline execution time from ~7 minutes to under 2 minutes.
