# Chapter 19: College Presentation Script & Viva Exam Preparation

This chapter prepares you to deliver an outstanding capstone project defense, complete with a structured 10-slide presentation script and 30 exhaustive viva questions with model answers.

---

## 1. 10-Slide Project Presentation Script

| Slide | Title | Key Talking Points |
| :--- | :--- | :--- |
| **01** | **Title & Introduction** | "Good morning, respected professors. Today I present **VulnTrack**, a full-stack, cloud-native Vulnerability Management System engineered with end-to-end DevOps automation and defense-in-depth security." |
| **02** | **Problem Statement** | "Enterprises manage hundreds of software assets. Without centralized vulnerability tracking and role-based remediation workflows, critical security flaws get overlooked until exploitation." |
| **03** | **Architecture Design** | "We implemented a Modular Monolith architecture deployed as decoupled containers. A React 18 SPA communicates with a Spring Boot 3.3 REST API backed by PostgreSQL 16." |
| **04** | **Backend & Database** | "Built using Spring Data JPA and Flyway migrations. Implemented strict DTO abstraction, ensuring JPA entities are never leaked over public REST APIs." |
| **05** | **Application Security (AppSec)** | "Role-Based Access Control separates read-only VIEWER personas from ADMINs. Passwords are salted and hashed with BCrypt (cost factor 12). Strict Bean Validation prevents parameter tampering." |
| **06** | **CI/CD Quality Gates** | "Our GitHub Actions pipeline enforces automated unit tests, GitLeaks secret scanning, and Trivy container vulnerability scanning before publishing immutable images to GHCR." |
| **07** | **Infrastructure as Code** | "We used Terraform to provision the cluster baseline: dedicated namespace, resource quotas, and limit ranges to prevent noisy-neighbor cluster exhaustion." |
| **08** | **Kubernetes & Autoscaling** | "Packaged via Helm. NGINX Ingress routes traffic cleanly. Horizontal Pod Autoscaler (HPA) scales backend replicas between 2 and 5 pods when CPU utilization crosses 70%." |
| **09** | **Observability** | "Prometheus scrapes Spring Boot Actuator `/actuator/prometheus` metrics, visualized in Grafana dashboards monitoring JVM memory, P95 latency, and error ratios." |
| **10** | **Live Demo & Conclusion** | "Demonstrating live asset registration, vulnerability logging, role switching, automated tests, and autoscaling. Thank you, I am ready for questions." |

---

## 2. Top 30 College Viva Questions & Answers

### Spring Boot & Backend
1. **Q: What is Dependency Injection and why is constructor injection preferred?**  
   *A:* Dependency Injection is an Inversion of Control pattern where the framework provides dependencies rather than objects creating them with `new`. Constructor injection is preferred because it guarantees immutability via `final` fields, prevents circular dependencies, and enables straightforward unit testing with Mockito.

2. **Q: Why should we never return JPA `@Entity` classes directly from REST controllers?**  
   *A:* Returning entities directly causes Mass Assignment vulnerabilities (attackers submitting protected fields), infinite JSON recursion from bidirectional relationships, and accidental leakage of internal database columns. DTOs isolate the external HTTP contract from the persistence layer.

3. **Q: What is the difference between `@RestController` and `@Controller`?**  
   *A:* `@Controller` is used in traditional MVC to render server-side HTML views (like Thymeleaf). `@RestController` combines `@Controller` and `@ResponseBody`, automatically serializing Java return objects into JSON.

4. **Q: What is the difference between `PUT` and `PATCH`?**  
   *A:* `PUT` is idempotent and replaces the entire resource. `PATCH` is designed for partial updates, modifying specific attributes (like updating a vulnerability status from `OPEN` to `FIXED`).

5. **Q: How does `GlobalExceptionHandler` improve application security?**  
   *A:* By catching exceptions and returning standardized `ErrorResponseDto` objects, it prevents default framework error pages from leaking internal file paths, framework versions, or database stack traces to attackers.

---

### Database & PostgreSQL
6. **Q: Why use Flyway instead of Hibernate `ddl-auto: update`?**  
   *A:* `ddl-auto: update` causes schema drift across developer environments, risks accidental column deletion, and provides no audit history. Flyway enforces deterministic, version-controlled SQL migrations executed in sequential transactions.

7. **Q: Why enforce foreign keys in PostgreSQL rather than just checking in Java?**  
   *A:* RDBMS constraints ensure referential integrity at the physical storage engine. If a script or concurrent thread deletes an asset, PostgreSQL prevents or cascades the deletion, preventing corrupted orphaned records that crash dashboards.

8. **Q: What is a B-Tree index and why did we add one to `vulnerabilities(severity)`?**  
   *A:* A B-Tree index provides $O(\log N)$ search complexity. Without an index, filtering by `severity = 'CRITICAL'` requires a full table scan ($O(N)$), which severely degrades performance as records grow into thousands.

---

### Frontend & React
9. **Q: What is the Virtual DOM in React?**  
   *A:* The Virtual DOM is an in-memory representation of real DOM elements. When state changes, React compares the Virtual DOM with the previous snapshot (diffing algorithm) and updates only the specific modified elements in the browser.

10. **Q: Why use `Promise.all` when fetching initial dashboard data?**  
    *A:* `Promise.all` executes independent API calls (`getDashboard`, `getAssets`, `getVulnerabilities`) concurrently over parallel HTTP network connections, cutting total initial load time by more than half.

---

### Docker & Containerization
11. **Q: Why are multi-stage Docker builds important?**  
    *A:* They decouple the build environment (which needs heavy SDKs like JDK 17, Maven, or Node) from the runtime environment. The final runner image contains only the minimal JRE and the compiled JAR, reducing image size by ~80% and minimizing attack vectors.

12. **Q: Why is running containers as non-root critical for security?**  
    *A:* If a container process running as `root` (UID 0) is exploited via remote code execution, an attacker escaping the container could gain administrative control of the host operating system. Running as `UID 10001` enforces container privilege boundaries.

---

### CI/CD & DevSecOps
13. **Q: What does "Shift Left" mean in cybersecurity?**  
    *A:* Moving security testing (secret scanning, SAST, dependency analysis, container scanning) earlier into the development lifecycle (during commit and pull request phases) rather than testing only in production.

14. **Q: What is the purpose of Trivy in our GitHub Actions pipeline?**  
    *A:* Trivy scans container images for known vulnerabilities (CVEs) in base OS packages and application dependencies, failing CI builds if unmitigated critical vulnerabilities are detected.

15. **Q: Why should workflows use least-privilege permissions?**  
    *A:* Limiting workflow token scopes (`contents: read`, `packages: write`) prevents an attacker who exploits a third-party action from modifying repository settings or tampering with repository branches.

---

### Kubernetes, Helm, & Terraform
16. **Q: What is the difference between Terraform and Helm in our project?**  
    *A:* Terraform manages platform infrastructure (namespaces, quotas, limit ranges, service accounts). Helm manages application workloads (deployments, pods, services, ingress, HPA).

17. **Q: What is the difference between `livenessProbe` and `readinessProbe`?**  
    *A:* `readinessProbe` determines if a pod is ready to accept user network traffic. `livenessProbe` determines if the container process is alive; if it deadlocks, kubelet restarts the container.

18. **Q: What are the two mandatory prerequisites for Horizontal Pod Autoscaling (HPA)?**  
    *A:* (1) `metrics-server` must be installed in the cluster to report resource utilization. (2) Containers must declare `resources.requests.cpu` so percentage utilization can be calculated.

19. **Q: How does NGINX Ingress differ from a standard Kubernetes Service?**  
    *A:* A Service provides Layer 4 (TCP/UDP) internal load balancing. NGINX Ingress operates at Layer 7 (HTTP/HTTPS), providing host-based and path-based routing (e.g., routing `/api` to backend and `/` to frontend) behind a single entry point.

20. **Q: What happens if a pod exceeds its memory limit (`limits.memory`)?**  
    *A:* The Linux kernel Out-Of-Memory (OOM) killer terminates the container, and Kubernetes marks the pod status as `OOMKilled` before restarting it.
