import { useEffect, useMemo, useState } from "react";
import type { AuditSnapshot } from "../core/types";
import type { ComparisonRow } from "../core/compare";
import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import { Input } from "./components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  RefreshCw,
  Search,
} from "lucide-react";

type Payload = AuditSnapshot & { comparison: ComparisonRow[] };
const targets = ["production", "preview", "development"] as const;

export function App() {
  const [data, setData] = useState<Payload | null>(null);
  const [query, setQuery] = useState("");
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [target, setTarget] = useState<(typeof targets)[number] | "all">("all");
  const [codeUsage, setCodeUsage] = useState<"all" | "used" | "unused">("all");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectQuery, setProjectQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("auto");
  const [viewportHeight, setViewportHeight] = useState(
    () => window.innerHeight,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = async (minimumLoadingMs = 0) => {
    const startedAt = Date.now();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/audit");
      const payload = (await response.json()) as Payload & { error?: string };
      if (!response.ok)
        throw new Error(payload.error ?? "Unable to load audit");
      setData(payload);
      setSelectedProjectIds((current) =>
        data
          ? current.filter((id) =>
              payload.projects.some((project) => project.id === id),
            )
          : payload.projects.map((project) => project.id),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load audit",
      );
    } finally {
      const remainingMs = minimumLoadingMs - (Date.now() - startedAt);
      if (remainingMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingMs));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAudit();
  }, []);

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  const visibleProjects =
    data?.projects.filter((project) =>
      selectedProjectIds.includes(project.id),
    ) ?? [];
  const filteredProjects =
    data?.projects.filter((project) =>
      project.name.toLowerCase().includes(projectQuery.toLowerCase()),
    ) ?? [];
  const allProjectsSelected = data
    ? selectedProjectIds.length === data.projects.length
    : false;
  const toggleProject = (projectId: string) =>
    setSelectedProjectIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    );

  const rows = useMemo(
    () =>
      data?.comparison.filter((row) => {
        if (!row.key.toLowerCase().includes(query.toLowerCase())) return false;
        if (codeUsage === "used" && !row.usedInRepository) return false;
        if (codeUsage === "unused" && row.usedInRepository) return false;
        if (onlyDifferences) {
          const values = visibleProjects.map(
            (project) => row.cells[project.id]?.exists ?? false,
          );
          if (!values.some((value) => value !== values[0])) return false;
        }
        if (
          target !== "all" &&
          !visibleProjects.some((project) =>
            row.cells[project.id]?.targets.includes(target),
          )
        )
          return false;
        return true;
      }) ?? [],
    [codeUsage, data, onlyDifferences, query, target, visibleProjects],
  );
  const rowsThatFit = Math.max(1, Math.floor((viewportHeight - 370) / 52));
  const effectivePageSize =
    pageSize === "auto" ? rowsThatFit : Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / effectivePageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedRows = rows.slice(
    (currentPage - 1) * effectivePageSize,
    currentPage * effectivePageSize,
  );
  const firstResult =
    rows.length === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
  const lastResult = Math.min(currentPage * effectivePageSize, rows.length);

  useEffect(() => {
    setPage(1);
  }, [
    query,
    target,
    codeUsage,
    onlyDifferences,
    selectedProjectIds,
    pageSize,
    viewportHeight,
  ]);

  if (!data && loading)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101114] text-slate-400">
        Loading audit…
      </main>
    );
  if (!data && error)
    return (
      <main className="flex min-h-screen max-w-xl flex-col justify-center bg-[#101114] px-7 text-slate-200">
        <h1 className="mb-2 text-3xl font-semibold">Could not load audit</h1>
        <p className="mb-5 text-sm text-red-300">{error}</p>
        <Button className="w-fit" onClick={() => void fetchAudit()}>
          <RefreshCw size={14} /> Try again
        </Button>
      </main>
    );
  if (!data) return null;
  return (
    <main className="mx-auto flex h-screen w-full max-w-[1180px] flex-col overflow-hidden bg-[#101114] px-7 py-[52px] text-[15px] text-[#e7e9ee] max-[700px]:px-4 max-[700px]:py-7">
      <header className="mb-[42px] flex items-start justify-between max-[700px]:mb-7">
        <div>
          <h1 className="text-3xl">
            .env
            <span className="text-[#e7e9ee]">
              <span className="opacity-75">s</span>
              <span className="opacity-65">i</span>
              <span className="opacity-[.55]">b</span>
              <span className="opacity-[.35]">l</span>
              <span className="opacity-[.25]">e</span>
            </span>
          </h1>
          {data.mode === "scan" && <p className="mt-2 text-sm text-slate-500">Repository scan · {data.workspace}</p>}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500">
            Updated {new Date(data.fetchedAt).toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            onClick={() => void fetchAudit(450)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
          <span className="flex items-center rounded-full border border-[#2b4437] bg-[#15251c] px-3 py-2 text-[13px] text-[#8fd4aa]">
            <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#64d18c]" />{" "}
            Connected
          </span>
        </div>
      </header>
      {error && (
        <div
          className="mb-6 rounded-md border border-[#5b3338] bg-[#28191d] px-3 py-2.5 text-[13px] text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}
      <section className="flex items-center gap-2.5 border-b border-[#292c33] pb-[18px] max-[700px]:flex-wrap">
        <div className="flex h-[38px] w-[250px] items-center gap-2 rounded-md border border-slate-700 bg-[#191b20] px-3 text-slate-500 max-[700px]:w-full">
          <Search size={15} />
          <Input
            className="h-9 border-0 bg-transparent px-0 focus:border-0"
            aria-label="Search variables"
            placeholder="Search variables…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select
          value={target}
          onValueChange={(value) => setTarget(value as typeof target)}
        >
          <SelectTrigger aria-label="Filter by environment">
            <SelectValue placeholder="All environments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All environments</SelectItem>
            {targets.map((item) => (
              <SelectItem key={item} value={item}>
                {item[0].toUpperCase() + item.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={codeUsage}
          onValueChange={(value) => setCodeUsage(value as typeof codeUsage)}
        >
          <SelectTrigger aria-label="Filter by code usage">
            <SelectValue placeholder="Code usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All variables</SelectItem>
            <SelectItem value="used">Used in repository</SelectItem>
            <SelectItem value="unused">Not used in repository</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="text-slate-200">
              Projects{" "}
              <span>
                {visibleProjects.length}/{data.projects.length}
              </span>
              <ChevronDown size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <div className="mb-1.5 flex items-center justify-between border-b border-[#2c3038] px-1 pb-2 text-xs font-semibold">
              <span>Compare projects</span>
              <Button
                variant="ghost"
                onClick={() =>
                  setSelectedProjectIds(
                    allProjectsSelected
                      ? []
                      : data.projects.map((project) => project.id),
                  )
                }
              >
                {allProjectsSelected ? "Clear all" : "Select all"}
              </Button>
            </div>
            <div className="my-1.5 flex h-8 items-center gap-1.5 rounded-md border border-slate-700 px-2 text-slate-500">
              <Search size={14} />
              <Input
                className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus:border-0 focus:ring-0"
                aria-label="Search projects"
                placeholder="Search projects…"
                value={projectQuery}
                onChange={(event) => setProjectQuery(event.target.value)}
              />
            </div>
            {filteredProjects.length === 0 ? (
              <p className="px-1.5 py-2 text-xs text-slate-500">
                No projects found.
              </p>
            ) : (
              filteredProjects.map((project) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-2 text-[13px] text-slate-300 hover:bg-slate-800"
                  key={project.id}
                >
                  <Checkbox
                    checked={selectedProjectIds.includes(project.id)}
                    onCheckedChange={() => toggleProject(project.id)}
                  />
                  <span>{project.name}</span>
                  {selectedProjectIds.includes(project.id) && (
                    <Check className="ml-auto text-[#8fd4aa]" size={14} />
                  )}
                </label>
              ))
            )}
          </PopoverContent>
        </Popover>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-400">
          <Checkbox
            checked={onlyDifferences}
            onCheckedChange={(checked) => setOnlyDifferences(checked === true)}
          />{" "}
          Only differences
        </label>
        <span className="ml-auto text-[13px] text-slate-500 max-[700px]:ml-0 max-[700px]:w-full">
          {rows.length} variables
        </span>
      </section>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[280px]">Variable</TableHead>
            {data.mode === "scan" && <TableHead className="min-w-[150px]">Code</TableHead>}
            {visibleProjects.map((project) => (
              <TableHead key={project.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {project.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{project.name}</TooltipContent>
                </Tooltip>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleProjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={1}
                className="py-9 text-center text-slate-500"
              >
                Select at least one project to compare.
              </TableCell>
            </TableRow>
          ) : (
            paginatedRows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="min-w-[280px] font-mono text-[13px] text-slate-100">
                  <span>{row.key}</span>
                </TableCell>
                {data.mode === "scan" && <TableCell className={row.usedInRepository ? "text-[#8fd4aa]" : "text-slate-500"}>{row.usedInRepository ? "Used in repository" : "Not used in repository"}</TableCell>}
                {visibleProjects.map((project) => {
                  const cell = row.cells[project.id];
                  return (
                    <TableCell
                      key={project.id}
                      className={
                        cell?.exists ? "text-[#8fd4aa]" : "text-slate-600"
                      }
                    >
                      <span>{cell?.exists ? "✓" : "—"}</span>
                      {cell?.exists && (
                        <small className="block max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-tight text-slate-500">
                          {cell.targets.join(" · ")}
                        </small>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-4 border-b border-[#292c33] py-4 max-[700px]:flex-col max-[700px]:items-start">
        <span className="text-xs text-slate-500">
          Showing {firstResult}–{lastResult} of {rows.length}
        </span>
        <div className="flex items-center gap-2 max-[700px]:w-full max-[700px]:justify-between">
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger
              aria-label="Variables per page"
              className="min-w-[105px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Fit screen ({rowsThatFit})</SelectItem>
              <SelectItem value="25">25 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ArrowLeft size={14} />
          </Button>
          <span className="min-w-[82px] text-center text-xs text-slate-400">
            Page {currentPage} of {pageCount}
          </span>
          <Button
            variant="outline"
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          >
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
      <footer className="pt-5 text-xs text-slate-500">
        Fetched {new Date(data.fetchedAt).toLocaleString()}
      </footer>
    </main>
  );
}
