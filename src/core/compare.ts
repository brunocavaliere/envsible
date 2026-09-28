import type { AuditSnapshot, EnvironmentTarget } from "./types";

export type ComparisonCell = {
  exists: boolean;
  targets: EnvironmentTarget[];
};

export type ComparisonRow = {
  key: string;
  usedInRepository?: boolean;
  cells: Record<string, ComparisonCell>;
};

export function buildComparison(snapshot: AuditSnapshot): ComparisonRow[] {
  const rows = new Map<string, ComparisonRow>();

  for (const key of snapshot.usedVariables ?? []) {
    rows.set(key, { key, usedInRepository: true, cells: {} });
  }

  for (const variable of snapshot.variables) {
    const row = rows.get(variable.key) ?? { key: variable.key, cells: {} };
    const current = row.cells[variable.projectId] ?? { exists: false, targets: [] };
    row.cells[variable.projectId] = {
      exists: true,
      targets: [...new Set([...current.targets, ...variable.targets])],
    };
    rows.set(variable.key, row);
  }

  return [...rows.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function isDifferent(row: ComparisonRow, projectIds: string[]) {
  const presence = projectIds.map((id) => row.cells[id]?.exists ?? false);
  return presence.some((value) => value !== presence[0]);
}
