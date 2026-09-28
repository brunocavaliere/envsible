export type EnvironmentTarget = "production" | "preview" | "development";

export type Project = {
  id: string;
  name: string;
  teamId?: string;
};

export type EnvironmentVariable = {
  key: string;
  projectId: string;
  targets: EnvironmentTarget[];
  gitBranch?: string;
  type?: string;
};

export type AuditSnapshot = {
  projects: Project[];
  variables: EnvironmentVariable[];
  usedVariables?: string[];
  fetchedAt: string;
  mode?: "dashboard" | "scan";
  workspace?: string;
};
