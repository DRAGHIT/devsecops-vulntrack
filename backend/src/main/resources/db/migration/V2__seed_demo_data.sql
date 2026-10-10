-- ==============================================================================
-- Flyway Migration: V2__seed_demo_data.sql
-- Purpose: Seed realistic demonstration assets and vulnerability findings
-- ==============================================================================

-- 1. Insert Demonstration Assets
INSERT INTO assets (id, name, type, environment, description, created_at)
VALUES
    (1, '[DEMO] Customer Portal Web Application', 'WEB_APPLICATION', 'PRODUCTION', 'Customer-facing frontend portal for account management and transactions.', CURRENT_TIMESTAMP - INTERVAL '15 DAY'),
    (2, '[DEMO] Core Banking & Payments API', 'API', 'PRODUCTION', 'RESTful payment gateway microservice processing financial transfers.', CURRENT_TIMESTAMP - INTERVAL '12 DAY'),
    (3, '[DEMO] User Identity & Auth Database', 'DATABASE', 'PRODUCTION', 'PostgreSQL cluster holding user credentials and session metadata.', CURRENT_TIMESTAMP - INTERVAL '10 DAY'),
    (4, '[DEMO] Internal Analytics Data Warehouse', 'DATABASE', 'STAGING', 'Staging analytics pipeline for business intelligence reporting.', CURRENT_TIMESTAMP - INTERVAL '8 DAY'),
    (5, '[DEMO] Staging Kubernetes Cluster Gateway', 'SERVER', 'STAGING', 'Reverse proxy and API gateway edge router in staging environment.', CURRENT_TIMESTAMP - INTERVAL '5 DAY');

-- Reset asset ID sequence
SELECT setval('assets_id_seq', (SELECT MAX(id) FROM assets));

-- 2. Insert Demonstration Vulnerabilities
INSERT INTO vulnerabilities (id, title, cve_id, description, severity, status, asset_id, created_at)
VALUES
    (1, '[DEMO] Remote Code Execution via Apache Log4j', 'CVE-2021-44228', 'JNDI lookup feature vulnerability allowing unauthenticated remote execution.', 'CRITICAL', 'OPEN', 2, CURRENT_TIMESTAMP - INTERVAL '4 DAY'),
    (2, '[DEMO] Spring Framework RCE (Spring4Shell)', 'CVE-2022-22965', 'Data binding flaw leading to arbitrary remote code execution via class loader.', 'CRITICAL', 'IN_PROGRESS', 2, CURRENT_TIMESTAMP - INTERVAL '3 DAY'),
    (3, '[DEMO] Insecure Direct Object Reference (IDOR) on User Profile', NULL, 'Parameter tampering allows authenticated users to view billing records of other tenants.', 'HIGH', 'OPEN', 1, CURRENT_TIMESTAMP - INTERVAL '3 DAY'),
    (4, '[DEMO] Missing Rate Limiting on Login Endpoint', NULL, 'Endpoint lacks brute-force throttling, exposing credentials to dictionary attacks.', 'MEDIUM', 'IN_PROGRESS', 1, CURRENT_TIMESTAMP - INTERVAL '2 DAY'),
    (5, '[DEMO] Weak TLS Cipher Suites Enabled', NULL, 'Legacy TLS 1.0 and 1.1 suites negotiated on staging ingress proxy.', 'LOW', 'FIXED', 5, CURRENT_TIMESTAMP - INTERVAL '1 DAY'),
    (6, '[DEMO] Outdated PostgreSQL Minor Version', 'CVE-2023-39417', 'SQL injection flaw in extension script installation commands.', 'HIGH', 'FIXED', 3, CURRENT_TIMESTAMP - INTERVAL '1 DAY');

-- Reset vulnerability ID sequence
SELECT setval('vulnerabilities_id_seq', (SELECT MAX(id) FROM vulnerabilities));
