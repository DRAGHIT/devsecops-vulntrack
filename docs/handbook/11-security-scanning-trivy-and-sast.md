# Chapter 11: Security Scanning: Trivy & Secret Scanning

In modern DevSecOps, security is **shifted left** — meaning security flaws are detected and blocked during the pull request phase rather than after deployment to production.

---

## 1. Container Vulnerability Scanning with Trivy

Even if your Java or TypeScript code is 100% bug-free, the underlying container operating system (Alpine Linux, OpenSSL, Busybox) might contain known vulnerabilities listed in the National Vulnerability Database (NVD).

**Trivy** (by Aqua Security) scans:
1. OS package dependencies (e.g., `libssl`, `apk`, `busybox`).
2. Language-specific dependencies (Maven jars, npm packages).
3. Misconfigurations in Dockerfiles.

### The Pipeline Step:
```yaml
- name: Run Trivy Vulnerability Scanner on Backend Image
  uses: aquasecurity/trivy-action@0.20.0
  with:
    image-ref: ghcr.io/${{ env.BACKEND_IMAGE_NAME }}:test
    format: 'sarif'
    output: 'trivy-backend-results.sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '0'
```

### The SARIF Standard
**SARIF** (Static Analysis Results Interchange Format) is an open JSON standard for security tools. By uploading the `.sarif` file via `github/codeql-action/upload-sarif`, vulnerabilities appear directly inside GitHub's native **Security → Code Scanning alerts** tab with CVE links and remediation advice.

---

## 2. Preventing Secret Leaks with GitLeaks

Hardcoding API tokens, database passwords, or private keys into git history is one of the most common causes of corporate security breaches. Once committed, even if deleted in a later commit, the secret persists in the git history tree.

**GitLeaks** scans git diffs using regular expressions and entropy algorithms to detect leaked secrets (AWS keys, private SSH keys, password hashes) before code is merged.
