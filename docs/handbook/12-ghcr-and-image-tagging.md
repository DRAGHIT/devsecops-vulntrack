# Chapter 12: GHCR & Container Image Tagging Strategies

Container registries store, version, scan, and distribute OCI (Open Container Initiative) compliant Docker images to Kubernetes clusters, staging environments, and developer machines.

---

## 1. What is GHCR (GitHub Container Registry)?

**GHCR** (`ghcr.io`) is GitHub's cloud-native container registry built on the OCI distribution specification. Unlike Docker Hub (which enforces strict pull rate limits of 100 pulls per 6 hours on anonymous requests), GHCR offers high availability and native integration with GitHub Actions:

```mermaid
flowchart LR
    A[CI Workflow Runner] -->|1. Authenticate with GITHUB_TOKEN| B[ghcr.io]
    A -->|2. Push OCI Layer Blobs & Manifest| B
    B -->|3. Pull Image securely| C[Kubernetes Cluster<br/>(Kind / EKS / GKE)]
```

### Key Advantages in Enterprise & College Projects:
- **Zero-Secret Automation**: The runner authenticates automatically using the temporary `${{ secrets.GITHUB_TOKEN }}` generated per workflow run.
- **Package Linking**: The published container packages appear directly on your GitHub repository page under "Packages".
- **Access Control**: Packages inherit the repository's visibility (public or private) without configuring third-party accounts.

---

## 2. Image Tagging Best Practices: The Danger of `:latest`

A notorious anti-pattern in beginner DevOps projects is relying on the `:latest` tag for deployments:

```yaml
# ❌ Dangerous Anti-Pattern:
containers:
  - name: backend
    image: ghcr.io/student/vulntrack-backend:latest
    imagePullPolicy: IfNotPresent
```

### Why `:latest` is Dangerous in Production:
1. **Non-Deterministic Deployments**: `:latest` is a mutable tag that constantly points to whichever build finished last. If two pods restart 10 minutes apart during a rolling deployment, Pod A might run version 1.2 while Pod B runs version 1.3, leading to database schema mismatch errors.
2. **Kubernetes Image Caching Glitch**: With `imagePullPolicy: IfNotPresent`, the Kubernetes node checks its local disk. If an image tagged `:latest` already exists on the worker node, Kubernetes skips downloading the updated container image, leaving stale code running!
3. **Broken Rollbacks**: If a critical bug causes the application to crash, you cannot rollback by running `kubectl rollout undo` because the cluster cannot distinguish between the broken `:latest` and the previous `:latest`.

---

## 3. The Enterprise Tagging Strategy: Semantic Versioning & Immutable Git SHAs

In VulnTrack, we follow the dual-tagging strategy:

```yaml
tags: |
  ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}:latest
  ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}:${{ github.sha }}
```

### Tagging Hierarchy Explained:
- **Short Git SHA (`git rev-parse --short HEAD` e.g., `a04fd6b`)**: Guarantees **immutability**. If a bug is detected in production pod `backend:a04fd6b`, an engineer can immediately run `git checkout a04fd6b` and reproduce the exact code state that produced that container.
- **Semantic Versioning (`v1.0.0`, `v1.1.0`)**: Used for official milestone releases, college submissions, or production tags:
  - `MAJOR`: Breaking changes (e.g., incompatible database schema migrations or removed API endpoints).
  - `MINOR`: New backward-compatible features (e.g., adding CSV export functionality).
  - `PATCH`: Backward-compatible bug fixes and CVE security patches.

---

## 4. Multi-Architecture Builds (AMD64 vs ARM64)

Modern developer laptops use Apple Silicon (M1/M2/M3 - ARM64 architecture), while traditional cloud servers and college lab PCs use Intel/AMD (x86_64 - AMD64).

If you build a Docker image locally on an Apple Silicon Mac without flags:
```bash
docker build -t backend:v1 .
```
It builds an **ARM64** binary. If you attempt to run that image on an Intel Linux server, it crashes with:
`exec /usr/bin/java: exec format error`

### How We Solve This in CI:
In `.github/workflows/ci.yml`, we use `docker/setup-qemu-action` and `docker/setup-buildx-action` to compile **Multi-Arch Manifests**:
```yaml
- name: Set up QEMU
  uses: docker/setup-qemu-action@v3

- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build Multi-Arch Image
  uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64,linux/arm64
```
Docker pushes a single manifest list. When Kubernetes pulls the image, it automatically receives the exact architecture required by that specific node!

---

## 5. Pulling from Private Registries in Kubernetes: `imagePullSecrets`

If your GHCR package is private, Kubernetes worker nodes cannot pull the image without authentication. You resolve this by generating a Kubernetes Docker Registry Secret:

```bash
kubectl create secret docker-registry ghcr-auth-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_PERSONAL_ACCESS_TOKEN \
  --docker-email=student@university.edu \
  -n vulntrack
```

Then reference it in your Helm `values.yaml` or Deployment manifest:
```yaml
spec:
  imagePullSecrets:
    - name: ghcr-auth-secret
```

---

## 6. Viva & Interview Questions on Container Registries

1. **Q: What is an OCI Image Manifest?**
   - **Answer**: An OCI Image Manifest is a JSON document that describes the container image. It specifies the media type, config digest, layer digests (cryptographic SHA-256 hashes of each tarball filesystem layer), and size.
2. **Q: What happens if an image layer is modified?**
   - **Answer**: Because layers are referenced by their SHA-256 content hashes, modifying any file changes the hash. This creates a new layer, guaranteeing that container layers are immutable and tamper-evident.
3. **Q: Why should we use `docker login` with a Personal Access Token (PAT) with minimal scopes instead of your account password?**
   - **Answer**: Passwords provide full account ownership. A PAT can be scoped strictly to `read:packages` or `write:packages` and can be revoked at any time without resetting your GitHub password.
