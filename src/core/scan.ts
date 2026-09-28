import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ignored = new Set([".git", "node_modules", "dist", "build", ".next", "coverage"]);
const extensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte"]);
const patterns = [ /\bprocess\.env\.([A-Z][A-Z0-9_]*)\b/g, /\bimport\.meta\.env\.([A-Z][A-Z0-9_]*)\b/g ];

export async function scanWorkspace(root: string): Promise<string[]> {
  const found = new Set<string>();
  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignored.has(entry.name)) continue;
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (extensions.has(path.slice(path.lastIndexOf(".")))) {
        const source = await readFile(path, "utf8");
        for (const pattern of patterns) for (const match of source.matchAll(pattern)) found.add(match[1]);
      }
    }
  }
  await visit(root);
  return [...found].sort();
}
