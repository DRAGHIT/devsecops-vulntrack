# Security Policy

## 1. Supported Versions

| Version | Supported          | Security Maintenance Status |
| ------- | ------------------ | --------------------------- |
| 1.0.x   | :white_check_mark: | Actively supported          |
| < 1.0   | :x:                | Deprecated / Development    |

---

## 2. Security Design Principles in VulnTrack

VulnTrack is intentionally engineered with a **Security by Design** philosophy:

1. **Principle of Least Privilege (PoLP)**:
   - Backend APIs enforce role segregation:
     - `ROLE_ADMIN`: Allowed full CRUD operations on Assets and Vulnerabilities.
     - `ROLE_VIEWER`: Strictly read-only access (`GET` endpoints). Modifications are rejected with `403 Forbidden`.
   - Containers run as non-root users (`UID 10001` or `appuser`) with read-only root filesystems where applicable.
   - Kubernetes deployments specify restrictive `securityContext` (disallowing privilege escalation, dropping all Linux capabilities except required network bindings).

2. **Defense in Depth**:
   - Authentication is required for all business endpoints.
   - Request bodies are strictly validated using Hibernate Validator (`@NotNull`, `@Size`, `@Pattern`).
   - Database queries use JPA parameterized statements (Hibernate) to eliminate SQL Injection (CWE-89).
   - Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and X-Frame-Options headers are enforced.

3. **Secret Hygiene**:
   - No credentials, API tokens, or secrets are hardcoded in the codebase.
   - Environment variables provide runtime credentials.
   - Sensitive fields in logs are masked, and debug logs are disabled in production builds.

4. **Automated Supply Chain Security**:
   - CI pipeline incorporates Trivy image vulnerability scanning and SAST checks.
   - Container image builds fail if vulnerabilities above `HIGH` severity without remediation are detected.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do not create a public GitHub issue**.
2. Email the maintainer or submit a Private Vulnerability Advisory via GitHub Security Advisories.
3. Include:
   - Step-by-step reproduction instructions or Proof of Concept (PoC).
   - Impact assessment (confidentiality, integrity, availability).
   - Suggested fix or mitigation.
4. We aim to acknowledge receipt within 48 hours and provide remediation status updates within 5 business days.
