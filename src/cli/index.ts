#!/usr/bin/env node

import { createServer, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { buildComparison } from "../core/compare";
import type { AuditSnapshot } from "../core/types";
import { VercelProvider } from "../providers/vercel";
import { demoSnapshot } from "./demo";
import { scanWorkspace } from "../core/scan";

const open = promisify(exec);
const port = Number(process.env.ENVSIBLE_PORT ?? 4173);
const version = "0.1.3";

function printHelp() {
  console.log(`Envsible ${version}

Audit environment variables configured in Vercel projects.

Commands:
  envsible dashboard       Open the Vercel projects dashboard
  envsible scan            Scan the current repository and open its dashboard
  envsible scan --print    Print variables found in the current repository
  envsible audit           Print a project comparison in the terminal
  envsible diff            Alias for audit

Options:
  --demo                  Use sample data instead of the Vercel API
  --help                  Show this help
  --version               Show the version

Environment:
  VERCEL_TOKEN             Vercel access token
  ENVSIBLE_PORT            Local server port (default: 4173)`);
}

async function loadSnapshot(demo: boolean): Promise<AuditSnapshot> {
  if (demo) return demoSnapshot;
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("Missing VERCEL_TOKEN. Use --demo for sample data.");
  const provider = new VercelProvider(token);
  const projects = await provider.listProjects();
  const variables = (await Promise.all(projects.map((project) => provider.listVariables(project.id)))).flat();
  return { projects, variables, usedVariables: await scanWorkspace(process.cwd()), fetchedAt: new Date().toISOString() };
}

async function main() {
  const command = process.argv[2] ?? "dashboard";
  const demo = process.argv.includes("--demo");

  if (command === "--help" || command === "-h") return printHelp();
  if (command === "--version" || command === "-v") return console.log(version);

  if (command === "scan" && process.argv.includes("--print")) {
    const variables = await scanWorkspace(process.cwd());
    console.log(`Found ${variables.length} environment variables in ${process.cwd()}`);
    console.log(variables.join("\n"));
    return;
  }

  if (command === "audit" || command === "diff") {
    const snapshot = await loadSnapshot(demo);
    console.table(buildComparison(snapshot).map((row) => ({
      Variable: row.key,
      ...Object.fromEntries(snapshot.projects.map((project) => [project.name, row.cells[project.id]?.exists ? "✓" : "✗"])),
    })));
    return;
  }

  const scanMode = command === "scan";
  if (command !== "dashboard" && !scanMode) throw new Error(`Unknown command: ${command}`);
  const server = createServer(async (request, response) => {
    if (request.url === "/api/audit") {
      try {
        const snapshot = await loadSnapshot(demo);
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ ...snapshot, mode: scanMode ? "scan" : "dashboard", workspace: process.cwd(), comparison: buildComparison(snapshot) }));
      } catch (error) {
        response.statusCode = 500;
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to load audit" }));
      }
      return;
    }
    await serveDashboard(request.url ?? "/", response);
  });
  server.listen(port, async () => {
    const url = `http://localhost:${port}`;
    console.log(`Envsible dashboard running at ${url}`);
    if (!process.env.CI) await open(`open ${url}`);
  });
}

async function serveDashboard(url: string, response: ServerResponse) {
  const packageDist = dirname(dirname(fileURLToPath(import.meta.url)));
  const dashboardRoot = existsSync(join(packageDist, "index.html"))
    ? packageDist
    : join(process.cwd(), "dist");
  const file = url === "/" ? "index.html" : url.slice(1);
  const path = join(dashboardRoot, file);
  if (!existsSync(path)) {
    response.statusCode = 404;
    response.end("Not found");
    return;
  }
  const contentType = file.endsWith(".js")
    ? "text/javascript"
    : file.endsWith(".css")
      ? "text/css"
      : "text/html";
  response.setHeader("Content-Type", contentType);
  response.end(await readFile(path));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
