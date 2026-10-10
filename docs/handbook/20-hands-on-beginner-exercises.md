# Chapter 20: Hands-On Beginner Exercises

To deepen your mastery of full-stack engineering and DevOps, here are 5 hands-on exercises you can implement to extend VulnTrack.

---

## 🛠️ Exercise 1: Add CVSS Score to Vulnerabilities

### Goal:
Store and display numeric Common Vulnerability Scoring System (CVSS v3.1) base scores (e.g., `9.8` for Critical, `7.5` for High).

### Step-by-Step Blueprint:
1. **Database Migration**: Create `src/main/resources/db/migration/V3__add_cvss_score.sql`:
   ```sql
   ALTER TABLE vulnerabilities ADD COLUMN cvss_score NUMERIC(3, 1);
   ```
2. **Entity & DTO**:
   - In `Vulnerability.java`, add `private Double cvssScore;`.
   - In `VulnerabilityRequestDto.java`, add validation:
     ```java
     @DecimalMin(value = "0.0", message = "CVSS score cannot be negative")
     @DecimalMax(value = "10.0", message = "CVSS score cannot exceed 10.0")
     Double cvssScore
     ```
3. **Frontend**: Add a numeric input in `VulnerabilityView.tsx` and render a colored CVSS badge next to the CVE ID.

---

## 🛠️ Exercise 2: Filter Vulnerabilities by Impacted Asset

### Goal:
Allow security teams to view findings for a specific software asset using an asset filter dropdown in the UI.

### Step-by-Step Blueprint:
1. In `VulnerabilityView.tsx`, add an `<select>` dropdown populated from the `assets` array.
2. In `selectedAssetId` state, pass the ID to `api.getVulnerabilities({ assetId: selectedAssetId })`.
3. Notice that our backend `VulnerabilityRepository.searchVulnerabilities()` already has `:assetId IS NULL OR v.asset.id = :assetId` query logic implemented!

---

## 🛠️ Exercise 3: Audit Logging for Status Transitions

### Goal:
Whenever a vulnerability is marked as `FIXED`, log a structured audit event with the timestamp and acting username.

### Step-by-Step Blueprint:
1. Create an `AuditLog` entity with `id`, `vulnerabilityId`, `oldStatus`, `newStatus`, `modifiedBy`, `timestamp`.
2. In `VulnerabilityService.updateStatus()`, before saving, extract the current authenticated username using Spring Security:
   ```java
   String username = SecurityContextHolder.getContext().getAuthentication().getName();
   ```
3. Save the `AuditLog` in the same database transaction (`@Transactional`).

---

## 🛠️ Exercise 4: Custom Business Metric in Prometheus

### Goal:
Track total vulnerabilities remediated over time as a custom business metric in Prometheus.

### Step-by-Step Blueprint:
1. Inject `MeterRegistry` into `VulnerabilityService.java`.
2. Define a counter:
   ```java
   private final Counter remediatedCounter;

   public VulnerabilityService(..., MeterRegistry meterRegistry) {
       this.remediatedCounter = Counter.builder("vulntrack_remediated_total")
           .description("Total number of vulnerabilities marked as fixed")
           .register(meterRegistry);
   }
   ```
3. In `updateStatus()`, when `newStatus == VulnerabilityStatus.FIXED`, call `remediatedCounter.increment()`.
4. Check `http://localhost:8080/actuator/prometheus` to view `vulntrack_remediated_total`!

---

## 🛠️ Exercise 5: Zero-Trust Kubernetes NetworkPolicy

### Goal:
Enforce network isolation so that only backend pods can communicate with PostgreSQL on port 5432 (blocking any other pod in the cluster).

### Step-by-Step Blueprint:
Create `helm/vulntrack/templates/networkpolicy-postgres.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ include "vulntrack.fullname" . }}-postgres-policy
  namespace: {{ .Values.global.namespace }}
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/component: postgres
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/component: backend
      ports:
        - protocol: TCP
          port: 5432
```
