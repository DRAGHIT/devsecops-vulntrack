# Chapter 02: Repository Structure and Request Flow

Understanding how a codebase is organized is the first step toward understanding how an enterprise system works. In this chapter, we explore the file layout of VulnTrack and trace the exact lifecycle of a network request from the browser to PostgreSQL and back.

---

## 1. Directory Anatomy

A professional full-stack repository maintains a clean separation between application source code, infrastructure, and deployment configurations:

```
vulntrack/
├── backend/                       # Spring Boot Java application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/vulntrack/
│   │   │   │   ├── config/        # SecurityFilterChain, WebMvc CORS, OpenApi
│   │   │   │   ├── controller/    # REST endpoints (HTTP handling)
│   │   │   │   ├── dto/           # Request and Response transfer records
│   │   │   │   ├── entity/        # Database JPA entities
│   │   │   │   ├── exception/     # Global error handling (@ControllerAdvice)
│   │   │   │   ├── repository/    # Spring Data JPA interfaces
│   │   │   │   ├── service/       # Business logic layer
│   │   │   │   └── VulnTrackApplication.java # Spring Boot entry point
│   │   │   └── resources/
│   │   │       ├── application.yml           # Core config
│   │   │       ├── application-docker.yml    # Container-specific overrides
│   │   │       └── db/migration/             # Flyway SQL migrations (V1, V2...)
│   │   └── test/java/com/vulntrack/          # JUnit 5 & Mockito test suites
│   ├── Dockerfile                 # Multi-stage Docker build
│   └── pom.xml                    # Maven dependency tree
│
├── frontend/                      # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/            # Reusable UI widgets (Navbar, StatCard, AssetModal)
│   │   ├── services/              # Axios HTTP client configuration
│   │   ├── types/                 # TypeScript interfaces (Asset, Vulnerability)
│   │   ├── App.tsx                # Master page layout and state coordinating
│   │   ├── index.css              # Dark-mode styling and animations
│   │   └── main.tsx               # React root renderer
│   ├── Dockerfile                 # Multi-stage build (Node build -> Nginx host)
│   └── package.json               # Frontend dependencies & scripts
│
├── docker/                        # Local developer composition
│   └── docker-compose.yml         # Postgres + Backend + Frontend one-click spinup
│
├── terraform/                     # Infrastructure as Code
│   ├── main.tf                    # Manages namespace, resource quotas, service accounts
│   ├── variables.tf
│   └── outputs.tf
│
├── helm/                          # Helm Kubernetes packaging
│   └── vulntrack/
│       ├── Chart.yaml
│       ├── values.yaml            # Environment parameter overrides
│       └── templates/             # Deployments, Services, Ingress, HPA
│
├── monitoring/                    # Observability setup
│   ├── prometheus/                # Prometheus configuration and alerting rules
│   └── grafana/                   # Pre-configured dashboard JSONs
│
└── docs/                          # Architecture guides & student handbook
```

---

## 2. The Layered Backend Architecture

Why not just write database queries directly inside the HTTP controller?

In software engineering, mixing HTTP parsing, database access, and validation creates fragile "spaghetti code." VulnTrack enforces the **Separation of Concerns (SoC)** principle using four distinct layers:

```mermaid
flowchart TD
    Client(["HTTP Client (Browser / Postman)"])
    
    subgraph ControllerLayer ["1. Controller Layer (@RestController)"]
        Ctrl["AssetController / VulnerabilityController<br/>- Receives HTTP requests<br/>- Validates input (@Valid)<br/>- Returns HTTP Status Codes (200, 201, 404)"]
    end
    
    subgraph ServiceLayer ["2. Service Layer (@Service)"]
        Svc["AssetService / VulnerabilityService<br/>- Pure business rules<br/>- Transaction management (@Transactional)<br/>- DTO to Entity conversions"]
    end
    
    subgraph RepoLayer ["3. Repository Layer (@Repository)"]
        Repo["AssetRepository / VulnerabilityRepository<br/>- Spring Data JPA interface<br/>- Generates safe SQL queries<br/>- Executes CRUD operations"]
    end
    
    subgraph DBLayer ["4. Database Layer (PostgreSQL)"]
        DB[("PostgreSQL 16 Tables<br/>- assets<br/>- vulnerabilities")]
    end

    Client -->|JSON Request| Ctrl
    Ctrl -->|Passes Validated DTO| Svc
    Svc -->|Manipulates Entities| Repo
    Repo -->|Parameterized SQL| DB
    DB -->|Result Set| Repo
    Repo -->|Entities| Svc
    Svc -->|Maps to ResponseDTO| Ctrl
    Ctrl -->|JSON Response| Client
```

---

## 3. Why We Never Expose JPA Entities Directly (The DTO Pattern)

A critical security and architectural best practice is: **Never return your database `@Entity` classes directly from your REST controllers.**

Instead, we use **DTOs (Data Transfer Objects)**:
- `AssetRequestDto` / `AssetResponseDto`
- `VulnerabilityRequestDto` / `VulnerabilityResponseDto`

### Dangers of returning Entities directly:
1. **Accidental Information Disclosure**: An entity might contain internal database flags, audit user IDs, or sensitive columns. If a new column is added to the database, it would be instantly leaked in API responses unless DTOs isolate the contract.
2. **Infinite Recursion**: If `Asset` has `List<Vulnerability>` and `Vulnerability` has `Asset`, Jackson JSON serialization will enter an infinite loop and throw a `StackOverflowError`.
3. **Mass Assignment Vulnerability**: When receiving JSON input directly into an entity, an attacker can supply fields like `"id": 1` or `"created_at": "1999-01-01"` to tamper with protected fields. DTOs restrict incoming data strictly to permissible fields (e.g., `name`, `type`, `description`).

---

## 4. Tracing a Request End-to-End: `POST /api/vulnerabilities`

Let us trace what happens when an administrator creates a vulnerability:

```mermaid
sequenceDiagram
    autonumber
    participant Client as React Client (POST /api/vulnerabilities)
    participant Filter as SecurityFilterChain
    participant Ctrl as VulnerabilityController
    participant Svc as VulnerabilityService
    participant Repo as VulnerabilityRepository
    participant DB as PostgreSQL

    Client->>Filter: POST with Header 'Authorization: Basic YWRtaW46...'
    Filter->>Filter: Decode credentials & verify authority (ROLE_ADMIN)
    alt Unauthorized
        Filter-->>Client: 401 Unauthorized / 403 Forbidden
    end
    Filter->>Ctrl: Forward request to createVulnerability(@Valid VulnerabilityRequestDto)
    Ctrl->>Ctrl: Hibernate Validator inspects annotations (@NotBlank, @NotNull)
    alt Validation Failure (e.g. empty title)
        Ctrl-->>Client: 400 Bad Request + {"error": "Title cannot be blank"}
    end
    Ctrl->>Svc: createVulnerability(dto)
    Svc->>Svc: Lookup related Asset by assetId
    alt Asset Not Found
        Svc-->>Client: 404 ResourceNotFoundException
    end
    Svc->>Svc: Construct Vulnerability entity with status=OPEN, now() timestamp
    Svc->>Repo: save(vulnerability)
    Repo->>DB: INSERT INTO vulnerabilities (title, severity, status, asset_id, ...) VALUES (?, ?, ?, ?, ...)
    DB-->>Repo: Saved row with auto-generated ID (e.g., 42)
    Repo-->>Svc: Entity with ID 42
    Svc->>Svc: Map entity into VulnerabilityResponseDto
    Svc-->>Ctrl: Return DTO
    Ctrl-->>Client: 201 Created + JSON payload
```

In Chapter 04 and 05, we will build out the exact Java classes and SQL migrations powering this lifecycle.
