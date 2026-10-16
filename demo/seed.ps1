# ==============================================================================
# VulnTrack demo seeder
#
# Why this exists: the `dev` profile runs an in-memory H2 database with
# spring.flyway.enabled=false and ddl-auto=create-drop, so Hibernate builds an
# EMPTY schema and the dashboard opens on zeros. The Docker Compose / Kubernetes
# path uses the `prod` profile, where Flyway applies V2__seed_demo_data.sql.
# Run this script after `mvnw spring-boot:run` to get the same demo dataset.
#
# Usage (PowerShell):
#   .\demo\seed.ps1
#   .\demo\seed.ps1 -BaseUrl http://localhost:8080 -AdminUser admin -AdminPass 'AdminSecurePassword!2026'
# ==============================================================================

param(
    [string]$BaseUrl   = "http://localhost:8080",
    [string]$AdminUser = "admin",
    [string]$AdminPass = "AdminSecurePassword!2026"
)

$ErrorActionPreference = "Stop"

$pair     = "${AdminUser}:${AdminPass}"
$credential = "Basic " + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pair))
$headers  = @{ Authorization = $credential; "Content-Type" = "application/json" }

function Invoke-Api($method, $path, $body) {
    $uri = "$BaseUrl$path"
    if ($null -ne $body) {
        $json = $body | ConvertTo-Json -Depth 5
        return Invoke-RestMethod -Uri $uri -Method $method -Headers $headers -Body $json
    }
    return Invoke-RestMethod -Uri $uri -Method $method -Headers $headers
}

Write-Host "`nVulnTrack demo seeder -> $BaseUrl`n" -ForegroundColor Cyan

# Idempotency: skip assets that already exist so re-running does not duplicate.
$existing = @()
try { $existing = @(Invoke-Api GET "/api/assets" $null | ForEach-Object { $_.name }) } catch { $existing = @() }

$assets = @(
    @{ name = "Payments API";       type = "API";             environment = "PRODUCTION"; description = "Payment gateway microservice handling card transactions" },
    @{ name = "Customer Portal";    type = "WEB_APPLICATION"; environment = "STAGING";    description = "External-facing customer self-service web portal" },
    @{ name = "Analytics Warehouse"; type = "DATABASE";        environment = "PRODUCTION"; description = "PostgreSQL warehouse feeding the BI reports" }
)

$assetIds = @{}
foreach ($asset in $assets) {
    if ($existing -contains $asset.name) {
        Write-Host "  = asset exists: $($asset.name)" -ForegroundColor DarkGray
        $match = Invoke-Api GET "/api/assets" $null | Where-Object { $_.name -eq $asset.name } | Select-Object -First 1
    } else {
        $match = Invoke-Api POST "/api/assets" $asset
        Write-Host "  + asset created: $($asset.name) (id $($match.id))" -ForegroundColor Green
    }
    $assetIds[$asset.name] = $match.id
}

$vulnerabilities = @(
    @{ asset = "Payments API"; title = "XZ Utils backdoor in liblzma";                cveId = "CVE-2024-3094";  severity = "CRITICAL"; status = "OPEN";        description = "Malicious liblzma build intercepts SSH authentication via patched ld.so; downgrade to 5.6.0 or rebuild from a trusted source." },
    @{ asset = "Payments API"; title = "runc container escape via leaked fd";          cveId = "CVE-2024-21626"; severity = "HIGH";     status = "IN_PROGRESS"; description = "Leaked file descriptors allow a hostile container to reach the host filesystem through /proc/self. Upgrade to runc 1.1.12+." },
    @{ asset = "Customer Portal"; title = "Log4Shell JNDI injection in logging stack"; cveId = "CVE-2021-44228"; severity = "CRITICAL"; status = "FIXED";       description = "log4j-core <= 2.14.1 performs unauthenticated JNDI lookups. Upgraded to log4j 2.17.1." },
    @{ asset = "Customer Portal"; title = "Verbose error pages expose stack traces";    cveId = "";               severity = "MEDIUM";   status = "FIXED";       description = "Custom 500 page leaked class paths and dependency versions to anonymous visitors." },
    @{ asset = "Analytics Warehouse"; title = "Default postgres superuser still enabled"; cveId = "";             severity = "HIGH";     status = "OPEN";        description = "Application connects as the database superuser; create a scoped role with least privilege." },
    @{ asset = "Analytics Warehouse"; title = "TLS not enforced for JDBC connection";   cveId = "";               severity = "LOW";      status = "IN_PROGRESS"; description = "Connection string omits sslmode=require, so credentials traverse the network in clear text." }
)

foreach ($vuln in $vulnerabilities) {
    $payload = [ordered]@{
        assetId     = $assetIds[$vuln.asset]
        title       = $vuln.title
        cveId       = $vuln.cveId
        description = $vuln.description
        severity    = $vuln.severity
        status      = $vuln.status
    }
    try {
        Invoke-Api POST "/api/vulnerabilities" $payload | Out-Null
        Write-Host "  + finding: $($vuln.severity) / $($vuln.title)" -ForegroundColor Green
    } catch {
        Write-Host "  ! skipped (already present or invalid): $($vuln.title)" -ForegroundColor Yellow
    }
}

$summary = Invoke-Api GET "/api/dashboard" $null
Write-Host "`nDashboard now reports: $($summary.totalAssets) assets, $($summary.openVulnerabilities) open findings, $($summary.criticalVulnerabilities) critical." -ForegroundColor Cyan
Write-Host "Open the UI and sign in as $AdminUser.`n" -ForegroundColor Cyan
