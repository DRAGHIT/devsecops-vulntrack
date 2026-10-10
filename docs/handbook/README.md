# VulnTrack: Comprehensive Student & DevOps Learning Handbook

Welcome to the **VulnTrack Learning Handbook**. This guide is designed specifically for students, aspiring AppSec engineers, and junior DevOps practitioners. It connects university coursework concepts (Data Structures, Relational Databases, Web Architecture, Operating Systems, Networking, and Cybersecurity) to modern, real-world cloud-native software engineering.

---

## 📚 Handbook Table of Contents

| Chapter | Title | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **01** | [Project Overview and Architecture](01-project-overview-and-architecture.md) | High-level system design, design trade-offs, and micro- vs monolithic architecture | ✅ Complete |
| **02** | [Repository Structure and Request Flow](02-repository-structure-and-request-flow.md) | Code organization, layered pattern, and end-to-end HTTP lifecycle | ✅ Complete |
| **03** | [React and TypeScript Basics](03-react-and-typescript-basics.md) | Components, state, effects, type safety, and API consumption | ✅ Complete |
| **04** | [Spring Boot Layered Architecture](04-spring-boot-architecture.md) | Controllers, Services, Repositories, DTOs, and Dependency Injection | ✅ Complete |
| **05** | [PostgreSQL Schema & Migrations](05-postgresql-schema-and-migrations.md) | Relational design, foreign keys, Flyway migrations, indexing | ✅ Complete |
| **06** | [REST API Standards and HTTP Codes](06-rest-apis-and-http-codes.md) | Idempotency, HTTP verbs, status code contracts, and error structures | ✅ Complete |
| **07** | [Authentication, RBAC & AppSec](07-authentication-rbac-and-appsec.md) | Spring Security filter chain, BCrypt, input sanitization, CSRF & CORS | ⏳ Phase 4 |
| **08** | [Automated Testing Strategy](08-automated-testing-strategy.md) | JUnit 5, Mockito, SpringBootTest, MockMvc, and frontend test suites | ⏳ Phase 4 |
| **09** | [Docker and Docker Compose](09-docker-and-docker-compose.md) | Containerization, multi-stage builds, non-root users, dev composition | ⏳ Phase 5 |
| **10** | [GitHub Actions and CI/CD Automation](10-github-actions-and-cicd.md) | Workflows, jobs, steps, environment secrets, and automated testing | ⏳ Phase 5 |
| **11** | [Security Scanning: Trivy & SAST](11-security-scanning-trivy-and-sast.md) | CVE detection, secret leakage prevention, vulnerability thresholds | ⏳ Phase 5 |
| **12** | [GHCR and Container Image Tagging](12-ghcr-and-image-tagging.md) | Package publishing, semantic versioning, immutable image digests | ⏳ Phase 5 |
| **13** | [Terraform: Infrastructure as Code](13-terraform-iac.md) | Declarative provisioning, state management, Kubernetes provider | ⏳ Phase 6 |
| **14** | [Kubernetes Fundamentals](14-kubernetes-fundamentals.md) | Pods, Deployments, Services, ConfigMaps, and Namespaces | ⏳ Phase 6 |
| **15** | [Helm, Ingress & Autoscaling (HPA)](15-helm-ingress-and-hpa.md) | Package manager, NGINX routing, horizontal pod autoscaling via metrics | ⏳ Phase 7 |
| **16** | [Prometheus and Grafana Monitoring](16-prometheus-and-grafana.md) | Pull-based metrics scraping, Actuator integration, and dashboarding | ⏳ Phase 7 |
| **17** | [End-to-End Local Deployment Guide](17-end-to-end-deployment-guide.md) | Complete step-by-step setup from zero to running cluster | ⏳ Phase 8 |
| **18** | [Troubleshooting Common Failures](18-troubleshooting-common-failures.md) | Port conflicts, CrashLoopBackOff, database timeouts, CORS errors | ⏳ Phase 8 |
| **19** | [College Viva & Presentation Script](19-college-viva-and-presentation.md) | Presentation slides outline, 30 common examiner viva Q&A | ⏳ Phase 8 |
| **20** | [Hands-on Beginner Exercises](20-hands-on-beginner-exercises.md) | 5 practice challenges to extend VulnTrack with new features | ⏳ Phase 8 |

---

## 🎯 Pedagogical Philosophy

1. **No "Magic" Code**: Every annotation, configuration block, and command is explained with the underlying mechanism that powers it.
2. **Security-First Mindset**: Security is not an afterthought added at the end; it is baked into every architecture choice.
3. **Step-by-Step Evolution**: We build from code logic → database → user interface → containers → automation → orchestration → observability.
