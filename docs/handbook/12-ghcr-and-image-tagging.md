# Chapter 12: GHCR & Container Image Tagging Strategies

Container registries store, version, and distribute OCI-compliant Docker images to Kubernetes clusters and developer machines.

---

## 1. What is GHCR (GitHub Container Registry)?

**GHCR** (`ghcr.io`) is GitHub's cloud-native container registry. Unlike legacy registries, GHCR is tightly integrated with GitHub Packages and permissions:
- The runner authenticates automatically using the temporary `${{ secrets.GITHUB_TOKEN }}` generated per workflow run.
- No long-lived personal access tokens (PATs) or external registry passwords need to be created or stored.

---

## 2. Image Tagging Best Practices: The Danger of `:latest`

A common anti-pattern in beginner projects is always tagging and deploying images with `:latest`:

```yaml
# ❌ Anti-pattern:
image: ghcr.io/username/vulntrack-backend:latest
```

### Why `:latest` is dangerous:
1. **Non-Deterministic**: `:latest` is a mutable pointer. Two pods deployed 10 minutes apart might pull two different code versions.
2. **Kubernetes Caching Bug**: If `imagePullPolicy: IfNotPresent` is used, the Kubernetes worker node will not pull the updated image because it already has a local layer labeled `:latest`.
3. **Impossible Rollbacks**: If a bug crashes production, you cannot roll back to "the previous `:latest`" because it has already been overwritten.

### The Solution: Immutable Git SHA Tagging
In our CI workflow, we tag every image with both `:latest` and the unique commit SHA:

```yaml
tags: |
  ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}:latest
  ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}:${{ github.sha }}
```

When Helm or Kubernetes deploys `backend:d4e12fa`, every engineer knows the exact git commit running in the cluster, and rollbacks can be executed in seconds by simply updating the SHA.
