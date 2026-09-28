import type { AuditSnapshot } from "../core/types";

export const demoSnapshot: AuditSnapshot = {
  fetchedAt: new Date().toISOString(),
  projects: [
    { id: "global", name: "arena-global" },
    { id: "europe", name: "arena-europe" },
    { id: "admin", name: "arena-admin" },
  ],
  variables: [
    { key: "DATABASE_URL", projectId: "global", targets: ["production", "preview"] },
    { key: "DATABASE_URL", projectId: "europe", targets: ["production", "preview"] },
    { key: "DATABASE_URL", projectId: "admin", targets: ["production"] },
    { key: "AUTH_SECRET", projectId: "global", targets: ["production", "preview"] },
    { key: "AUTH_SECRET", projectId: "europe", targets: ["production", "preview"] },
    { key: "AUTH_SECRET", projectId: "admin", targets: ["production"] },
    { key: "FEATURE_X", projectId: "global", targets: ["production", "preview"] },
    { key: "FEATURE_X", projectId: "admin", targets: ["production"] },
    { key: "EU_TAX_API_KEY", projectId: "europe", targets: ["production"] },
  ],
};
