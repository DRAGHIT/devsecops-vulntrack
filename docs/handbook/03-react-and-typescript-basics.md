# Chapter 03: React 18 & TypeScript Architecture in VulnTrack

In modern cloud-native architectures, the user interface is decoupled from the backend API. In this chapter, we explore how VulnTrack's frontend is constructed with **React 18**, **TypeScript**, and **Vite**, adhering to modern frontend best practices.

---

## 1. Why React and TypeScript?

### Why React?
Traditional multi-page web applications reloaded the entire page on every click. **React** uses a **Virtual DOM** and a declarative component model to re-render only the specific DOM elements that changed (e.g., updating a vulnerability status pill from `OPEN` to `FIXED` without reloading the page).

### Why TypeScript?
JavaScript is dynamically typed, meaning a typo like `finding.severty` fails silently at runtime. **TypeScript** adds static type verification at compile time:
- The compiler catches mismatched property names immediately.
- Autocomplete and IntelliSense provide instant feedback during development.
- Refactoring backend DTOs is immediately reflected across all frontend components.

---

## 2. Domain Data Contracts (`src/types/index.ts`)

We map backend DTOs directly to TypeScript interfaces:

```typescript
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type VulnerabilityStatus = 'OPEN' | 'IN_PROGRESS' | 'FIXED';
export type UserRole = 'ADMIN' | 'VIEWER';

export interface Asset {
  id: number;
  name: string;
  type: string;
  environment: string;
  description?: string;
  createdAt: string;
  vulnerabilityCount: number;
}

export interface Vulnerability {
  id: number;
  title: string;
  cveId?: string;
  description?: string;
  severity: Severity;
  status: VulnerabilityStatus;
  assetId: number;
  assetName: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalAssets: number;
  openVulnerabilities: number;
  criticalVulnerabilities: number;
  fixedVulnerabilities: number;
  severityCounts: Record<string, number>;
  recentFindings: Vulnerability[];
}
```

---

## 3. Core React Hooks in VulnTrack

### `useState` (Local Component State)
Tracks state changes over time (e.g., active tab, form inputs, modal visibility):
```typescript
const [currentTab, setCurrentTab] = useState<'dashboard' | 'assets' | 'vulnerabilities'>('dashboard');
const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
```

### `useEffect` & `useCallback` (Data Fetching Lifecycle)
When the application first mounts in the browser, `useEffect` triggers an asynchronous call to Spring Boot:
```typescript
const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    const [dashData, assetData, vulnData] = await Promise.all([
      api.getDashboard(),
      api.getAssets(),
      api.getVulnerabilities()
    ]);
    setSummary(dashData);
    setAssets(assetData);
    setVulnerabilities(vulnData);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Backend connection failed');
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

> [!TIP]
> `Promise.all` executes all three API requests concurrently over HTTP/2 or Keep-Alive connections, reducing total initial page load time by 60% compared to sequential `await` calls.

---

## 4. Component Structure

The frontend is divided into focused, reusable functional components:

```mermaid
graph TD
    App[App.tsx<br/>Master State & Navigation]
    Navbar[Navbar.tsx<br/>Branding, Tabs & RBAC Switcher]
    Dashboard[DashboardView.tsx<br/>KPI Cards & Distribution Bar]
    Assets[AssetView.tsx<br/>Asset Catalog & New Asset Modal]
    Vulns[VulnerabilityView.tsx<br/>Finding Filters, Status Updates & Log Modal]

    App --> Navbar
    App --> Dashboard
    App --> Assets
    App --> Vulns
```

### 1. [Navbar.tsx](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/frontend/src/components/Navbar.tsx)
Includes an interactive **RBAC Persona Toggle** (`ADMIN` vs `VIEWER`). When an examiner clicks this button:
- The active credentials switch between `admin` and `viewer`.
- Mutation controls (creating an asset, logging a vulnerability, updating status, deleting) dynamically disable, demonstrating backend security constraints in real-time.

### 2. [DashboardView.tsx](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/frontend/src/components/DashboardView.tsx)
- Four high-level KPI cards (Total Assets, Critical Risks, Open Findings, Fixed Findings).
- A severity distribution bar visually showing risk breakdown.
- A recent discoveries audit table with CVE tags and timestamps.

### 3. [AssetView.tsx](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/frontend/src/components/AssetView.tsx)
- Displays registered applications, environments, and finding counts.
- Modal dialog for registering new assets with form validation.

### 4. [VulnerabilityView.tsx](file:///c:/Users/LENOVO/Documents/Desktop/desk/3rd%20year/Devops/Devops%20Project/frontend/src/components/VulnerabilityView.tsx)
- Severity filters (`ALL`, `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and status filters.
- In-place dropdown selector enabling security engineers to update remediation status (`OPEN` → `IN_PROGRESS` → `FIXED`).

---

## 5. Automated Frontend Testing with Vitest

We use **Vitest** with `@testing-library/react` and `jsdom`:
- Tests verify component rendering, user interactions, and error handling.
- To run frontend tests:
  ```powershell
  cd frontend
  npm test
  ```
