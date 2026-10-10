# Chapter 05: PostgreSQL Schema, Relationships, & Database Migrations

In enterprise environments, manual SQL script execution is dangerous and prone to human error. In this chapter, we explore how VulnTrack designs its relational database schema and manages schema evolution using **Flyway**.

---

## 1. Why Use Flyway Database Migrations?

In many university projects, developers either use Hibernate's `ddl-auto: update` or run raw SQL files manually in pgAdmin. 

### Why `ddl-auto: update` is dangerous in production:
1. **Schema Drift**: When multiple developers work on different branches, databases quickly fall out of sync.
2. **Accidental Data Loss**: Hibernate may rename or drop columns without warning when entity fields change.
3. **No Rollback or Audit Trail**: You cannot audit which version of the schema was deployed to production.

### How Flyway Solves This:
Flyway tracks schema changes using versioned SQL scripts located in `src/main/resources/db/migration/`:
- `V1__init_schema.sql`
- `V2__seed_demo_data.sql`

When Spring Boot starts up in the `prod` profile, Flyway creates a metadata table called `flyway_schema_history`. It checks checksums and executes pending migrations in strict sequential order within an isolated transaction.

---

## 2. Baseline Schema Design (`V1__init_schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    environment VARCHAR(30) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vulnerabilities (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    cve_id VARCHAR(25),
    description VARCHAR(1000),
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    asset_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vulnerabilities_asset FOREIGN KEY (asset_id)
        REFERENCES assets(id) ON DELETE CASCADE
);
```

### Relational Constraints Explained:
- **`BIGSERIAL PRIMARY KEY`**: A 64-bit auto-incrementing integer (up to 9 quintillion values), preventing integer overflow.
- **`CONSTRAINT fk_vulnerabilities_asset`**: Enforces referential integrity at the database storage engine. A vulnerability cannot be orphaned or assigned to a non-existent asset.
- **`ON DELETE CASCADE`**: When an asset is deleted, PostgreSQL automatically cleans up all associated vulnerability findings, preventing orphaned rows.

---

## 3. High-Performance Indexing Strategy

In `V1__init_schema.sql`, we create targeted B-Tree indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_asset_id ON vulnerabilities(asset_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_created_at ON vulnerabilities(created_at DESC);
```

### Why Indexing Matters:
Without an index on `severity`, a query like:
```sql
SELECT count(*) FROM vulnerabilities WHERE severity = 'CRITICAL';
```
requires a **Sequential Scan** (examining every row in the table, $O(N)$ complexity).
With a B-Tree index, PostgreSQL performs an **Index Scan** in $O(\log N)$ time, ensuring instant dashboard queries even as finding counts grow.

---

## 4. Connection Pooling with HikariCP

Creating a new TCP socket connection and performing TLS/authentication handshakes with PostgreSQL takes tens of milliseconds.

To achieve microsecond database access, Spring Boot uses **HikariCP**, the fastest connection pool available:
- **Pre-warmed Pool**: Maintains a pool of ready-to-use connections (`minimum-idle: 2`, `maximum-pool-size: 10`).
- **Connection Borrowing**: When a web request starts a transaction, it borrows a connection from the pool and returns it immediately after committing.
- **Resource Protection**: Caps concurrent database load to prevent overwhelming the database server CPU and RAM.
