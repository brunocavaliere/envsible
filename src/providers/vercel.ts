import type { EnvironmentTarget, EnvironmentVariable, Project } from "../core/types";

const API_BASE = "https://api.vercel.com";

type VercelProject = { id: string; name: string; accountId?: string };
type VercelVariable = {
  key: string;
  target?: string[];
  gitBranch?: string;
  type?: string;
  projectId?: string;
};

export class VercelProvider {
  constructor(private readonly token: string) {}

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!response.ok) {
      throw new Error(`Vercel API error (${response.status})`);
    }
    return response.json() as Promise<T>;
  }

  async listProjects(): Promise<Project[]> {
    const data = await this.request<{ projects: VercelProject[] }>("/v9/projects?limit=100");
    return data.projects.map(({ id, name, accountId }) => ({ id, name, teamId: accountId }));
  }

  async listVariables(projectId: string): Promise<EnvironmentVariable[]> {
    const data = await this.request<{ envs: VercelVariable[] }>(`/v9/projects/${encodeURIComponent(projectId)}/env`);
    return data.envs.map((variable) => ({
      key: variable.key,
      projectId,
      targets: (variable.target ?? []).filter(isEnvironmentTarget),
      gitBranch: variable.gitBranch,
      type: variable.type,
    }));
  }
}

function isEnvironmentTarget(value: string): value is EnvironmentTarget {
  return value === "production" || value === "preview" || value === "development";
}
