# Chapter 11: Security Scanning: Trivy, SAST & Secret Detection

In traditional IT operations, security was an afterthought evaluated right before or after going live. In modern **DevSecOps**, security is **shifted left** — meaning security flaws, leaked secrets, and vulnerable dependencies are detected and blocked automatically during the Pull Request phase before merging.

---

## 1. The DevSecOps "Shift Left" Paradigm

```mermaid
flowchart LR
    subgraph Traditional [Traditional Waterfall Security]
        A1[Code] --> A2[Build] --> A3[Deploy] --> A4[Security Audit<br/>(Late & Expensive!)]
    end

    subgraph Modern [DevSecOps Shift Left Security]
        B1[Developer IDE<br/>Linting & SAST] --> B2[Pre-Commit<br/>GitLeaks] --> B3[CI Pipeline<br/>Trivy & Dependency-Check] --> B4[Safe Production<br/>Kubernetes Admission]
    end

    style A4 fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style B3 fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
```

Catching a security vulnerability in production costs roughly **30x to 100x more** in incident response, patch deployment, and customer trust than catching it in a local CI build.

---

## 2. Container Vulnerability Scanning with Trivy

Even if your Spring Boot Java code is 100% bug-free and follows OWASP Top 10 guidelines, your container image might still be vulnerable. Why? Because Docker images contain an operating system layer (`/bin/sh`, `glibc`, `openssl`, `apk`, `ca-certificates`).

### What Trivy Scans
**Trivy** (by Aqua Security) is a comprehensive open-source security scanner that performs:
1. **OS Package Scanning**: Matches installed packages against Alpine, Debian, RedHat security advisories.
2. **Language Dependencies**: Inspects `pom.xml`, `package-lock.json`, and nested `.jar` files against the National Vulnerability Database (NVD) and GitHub Advisory Database.
3. **Misconfiguration Scanning**: Inspects Dockerfiles for insecure patterns (e.g., running as `root`, missing healthchecks, exposing unnecessary ports).

### The VulnTrack Trivy CI Step
In `.github/workflows/ci.yml`:
```yaml
- name: Run Trivy Vulnerability Scanner on Backend Image
  uses: aquasecurity/trivy-action@0.20.0
  with:
    image-ref: ghcr.io/${{ env.BACKEND_IMAGE_NAME }}:test
    format: 'sarif'
    output: 'trivy-backend-results.sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '0' # Use '1' to block PRs on critical CVEs in production

- name: Upload SARIF report to GitHub Security Tab
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-backend-results.sarif'
```

### The SARIF Standard
**SARIF** (Static Analysis Results Interchange Format) is an OASIS JSON standard. When GitHub ingests a `.sarif` file, it highlights the exact line of code or container package directly in the pull request:
- Displays Common Vulnerabilities and Exposures ID (e.g., `CVE-2024-38816`).
- Provides Common Vulnerability Scoring System (CVSS) score (e.g., 9.8 Critical).
- Shows remediation steps (e.g., *"Upgrade spring-web to 6.1.13 or higher"*).

---

## 3. Base Image Hardening: Alpine vs. Debian Slim vs. Distroless

In VulnTrack, we intentionally chose **Alpine Linux** (`eclipse-temurin:17-jre-alpine` and `nginx:1.25-alpine`) because of vulnerability surface area:

| Base Image Type | Typical Image Size | Installed System Packages | Typical CVE Count |
| :--- | :--- | :--- | :--- |
| **Full Ubuntu / Debian** | ~800 MB - 1.2 GB | 400+ packages (python, perl, curl, systemd) | 40 - 100+ CVEs |
| **Debian Slim** | ~250 MB | ~120 packages | 10 - 25 CVEs |
| **Alpine Linux (VulnTrack)** | ~180 MB | ~30 minimal packages (musl libc, busybox) | **0 - 2 CVEs** |
| **Google Distroless** | ~140 MB | ~10 packages (no package manager, no shell) | **0 - 1 CVEs** |

> **Pro-Tip**: Removing the package manager (`apt-get`, `apk`) and system shell (`/bin/sh`, `/bin/bash`) prevents attackers who achieve Remote Code Execution (RCE) from downloading malicious payload scripts (e.g., `curl | sh`).

---

## 4. Preventing Secret Leaks with GitLeaks

Hardcoding credentials, API tokens, database passwords, or private keys into Git is one of the most common causes of corporate data breaches.

### The Permanence of Git Commits
A common junior developer mistake:
1. Commit code containing `db_password = "MySuperSecretPassword!"`.
2. Push to GitHub.
3. Realize the mistake, edit the file to use an environment variable, and commit again.

**The Danger**: Git is a content-addressable version control system. The secret remains stored forever in the Git object database (`.git/objects/`). Anyone who clones the repo can view the secret with:
```bash
git log -p -S "MySuperSecretPassword!"
```

### How GitLeaks Protects You
GitLeaks executes during CI to scan:
- Uncommitted git diffs.
- Entire commit histories.
- High-entropy strings (e.g., Base64 strings, hex private keys) using Shannon Entropy mathematics.

### What to Do If You Accidentally Leak a Secret
1. **Rotate the Secret Immediately**: Invalidate the leaked password, database credential, or API key in the target system. Assume it is compromised the second it hit GitHub.
2. **Purge Git History**: Use `git-filter-repo` or BFG Repo-Cleaner to rewrite commit history and remove the blob permanently.
3. **Never rely solely on rewriting history**: Once a repository is public, automated crawler bots mirror commits in sub-second time.

---

## 5. Viva & Interview Questions on Security Scanning

1. **Q: What is the difference between SAST and DAST?**
   - **Answer**:
     - **SAST (Static Application Security Testing)**: Scans uncompiled or compiled source code without running the application (e.g., SonarQube, Semgrep, Trivy code scanner).
     - **DAST (Dynamic Application Security Testing)**: Tests the running web application from the outside by simulating real attacks (e.g., OWASP ZAP, Burp Suite).
2. **Q: What is a CVSS Score?**
   - **Answer**: Common Vulnerability Scoring System (currently v3.1 / v4.0), ranging from 0.0 to 10.0:
     - Low: 0.1 - 3.9
     - Medium: 4.0 - 6.9
     - High: 7.0 - 8.9
     - Critical: 9.0 - 10.0
3. **Q: Why should container images not run as the root user?**
   - **Answer**: If an attacker exploits a zero-day vulnerability in the web application (like Log4Shell or Spring4Shell), running as `root` grants root permissions inside the container. If container isolation fails (container escape / kernel exploit), the attacker gains root control over the underlying host node. VulnTrack runs as `appuser` (UID 10001).
