"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddVulnerabilityModal } from "@/components/vulnerabilities/AddVulnerabilityModal";
import { EditVulnerabilityModal } from "@/components/vulnerabilities/EditVulnerabilityModal";
import { VulnerabilityActions } from "@/components/vulnerabilities/VulnerabilityActions";
import { ShieldLoader } from "@/components/ui/ShieldLoader";
import { cn } from "@/lib/utils";
import { Vulnerability } from "@/types";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const SeverityDistributionChart = dynamic(
  () =>
    import("@/components/charts/DashboardCharts").then(
      (mod) => mod.SeverityDistributionChart,
    ),
  {
    ssr: false,
    loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-[var(--bg-tertiary)]" />,
  },
);

const RiskAssessmentView = dynamic(
  () =>
    import("@/components/vulnerabilities/RiskAssessmentView").then(
      (mod) => mod.RiskAssessmentView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/40 p-4 text-sm text-[var(--text-muted)]">
        Loading risk assessment...
      </div>
    ),
  },
);

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SeverityDistributionItem {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  count: number;
}

interface SourceDistributionItem {
  source: string;
  count: number;
}

interface EPSSDistribution {
  high: number;
  medium: number;
  low: number;
  minimal: number;
}

interface VulnerabilitiesSummary {
  severityDistribution: SeverityDistributionItem[];
  sourceDistribution: SourceDistributionItem[];
  epssDistribution: EPSSDistribution;
  exploitedCount?: number;
}

interface VulnerabilitiesResponse {
  data: Vulnerability[];
  pagination: PaginationState;
  summary: VulnerabilitiesSummary;
}

const severityOptions = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const statusOptions = [
  "OPEN",
  "IN_PROGRESS",
  "MITIGATED",
  "FIXED",
  "ACCEPTED",
  "FALSE_POSITIVE",
] as const;

const workflowOptions = ["NEW", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

const workflowTransitions: Record<(typeof workflowOptions)[number], (typeof workflowOptions)[number][]> = {
  NEW: ["TRIAGED", "IN_PROGRESS", "CLOSED"],
  TRIAGED: ["IN_PROGRESS", "RESOLVED", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "TRIAGED", "CLOSED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
};

const numberFormatter = new Intl.NumberFormat("en-US");

const severityColor: Record<string, string> = {
  CRITICAL: "text-[var(--badge-critical-text)] border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)]",
  HIGH: "text-[var(--badge-high-text)] border-[var(--badge-high-border)] bg-[var(--badge-high-bg)]",
  MEDIUM: "text-[var(--badge-medium-text)] border-[var(--badge-medium-border)] bg-[var(--badge-medium-bg)]",
  LOW: "text-[var(--badge-low-text)] border-[var(--badge-low-border)] bg-[var(--badge-low-bg)]",
  INFORMATIONAL: "text-[var(--badge-info-text)] border-[var(--badge-info-border)] bg-[var(--badge-info-bg)]",
};

const statusColor: Record<string, string> = {
  OPEN: "text-[var(--badge-critical-text)] border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)]",
  IN_PROGRESS: "text-[var(--accent-1-strong)] border-[var(--line-3)] bg-[var(--accent-1-soft)]",
  MITIGATED: "text-[var(--accent-1)] border-[var(--line-3)] bg-[var(--accent-1-soft)]",
  FIXED: "text-[var(--badge-low-text)] border-[var(--badge-low-border)] bg-[var(--badge-low-bg)]",
  ACCEPTED: "text-[var(--badge-info-text)] border-[var(--badge-info-border)] bg-[var(--badge-info-bg)]",
  FALSE_POSITIVE: "text-[var(--badge-info-text)] border-[var(--badge-info-border)] bg-[var(--badge-info-bg)]",
};

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toChartSeverityData(data: SeverityDistributionItem[]) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return data.map((item) => ({
    ...item,
    percentage: total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0,
  }));
}

function getSlaBadge(slaDueAt?: string | Date | null) {
  if (!slaDueAt) {
    return {
      label: "No SLA",
      tone: "border-[var(--badge-info-border)] bg-[var(--badge-info-bg)] text-[var(--badge-info-text)]",
    };
  }

  const due = new Date(slaDueAt);
  const remainingMs = due.getTime() - Date.now();
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  if (remainingMs < 0) {
    return {
      label: `SLA Breached ${Math.abs(remainingDays)}d`,
      tone: "border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] text-[var(--badge-critical-text)]",
    };
  }

  if (remainingDays <= 3) {
    return {
      label: `SLA ${remainingDays}d left`,
      tone: "border-[var(--badge-medium-border)] bg-[var(--badge-medium-bg)] text-[var(--badge-medium-text)]",
    };
  }

  return {
    label: `SLA ${remainingDays}d left`,
    tone: "border-[var(--badge-low-border)] bg-[var(--badge-low-bg)] text-[var(--badge-low-text)]",
  };
}

function VulnerabilitiesContent() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [showExploited, setShowExploited] = useState(false);
  const [showKevOnly, setShowKevOnly] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [summary, setSummary] = useState<VulnerabilitiesSummary | null>(null);
  const [activeVulnId, setActiveVulnId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [workflowUpdatingId, setWorkflowUpdatingId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVuln, setEditingVuln] = useState<Vulnerability | null>(null);
  const searchParams = useSearchParams();

  // Sync search query from URL on mount
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
      // Auto-expand if the search param looks like a ID/CVE
      setActiveVulnId(query);
    }
  }, [searchParams]);

  const fetchVulnerabilities = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setError(null);

        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });

        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (selectedSeverity !== "ALL") params.set("severity", selectedSeverity);
        if (selectedStatus !== "ALL") params.set("status", selectedStatus);
        if (selectedWorkflow !== "ALL") params.set("workflowState", selectedWorkflow);
        if (selectedSource !== "ALL") params.set("source", selectedSource);
        if (showExploited) params.set("exploited", "true");
        if (showKevOnly) params.set("kev", "true");

        const response = await fetch(`/api/vulnerabilities?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch vulnerabilities");
        }

        const result = (await response.json()) as VulnerabilitiesResponse;
        setVulns(result.data ?? []);
        setSummary(result.summary ?? null);
        setPagination((prev) => ({
          ...prev,
          ...result.pagination,
          page: result.pagination?.page ?? prev.page,
          total: result.pagination?.total ?? prev.total,
          totalPages: result.pagination?.totalPages ?? prev.totalPages,
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch vulnerabilities");
        setVulns([]);
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [
      pagination.page,
      pagination.limit,
      searchQuery,
      selectedSeverity,
      selectedStatus,
      selectedWorkflow,
      selectedSource,
      showExploited,
      showKevOnly,
    ],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchVulnerabilities();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchVulnerabilities]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setActionError(null);
        setDeletingId(id);

        const response = await fetch(`/api/vulnerabilities/${id}`, {
          method: "DELETE",
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error || "Failed to delete vulnerability");
        }

        await fetchVulnerabilities({ silent: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete vulnerability";
        setActionError(message);
      } finally {
        setDeletingId(null);
      }
    },
    [fetchVulnerabilities],
  );

  const exportData = async (format: "csv" | "xlsx") => {
    try {
      const response = await fetch(`/api/exports/vulnerabilities?format=${format}`);
      if (!response.ok) {
        throw new Error("Failed to export vulnerabilities");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vulnerabilities.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to export");
    }
  };

  const transitionWorkflow = useCallback(
    async (vuln: Vulnerability, toState: (typeof workflowOptions)[number]) => {
      try {
        setActionError(null);
        setWorkflowUpdatingId(vuln.id);

        const response = await fetch(`/api/vulnerabilities/${vuln.id}/workflow`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toState,
            assignedUserId: vuln.assignedUserId ?? undefined,
            assignedTeam: vuln.assignedTeam ?? undefined,
          }),
        });

        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(result.error || "Failed to update workflow state");
        }

        await fetchVulnerabilities({ silent: true });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to update workflow");
      } finally {
        setWorkflowUpdatingId(null);
      }
    },
    [fetchVulnerabilities],
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSeverity("ALL");
    setSelectedStatus("ALL");
    setSelectedWorkflow("ALL");
    setSelectedSource("ALL");
    setShowExploited(false);
    setShowKevOnly(false);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const severityDistribution = useMemo(
    () => summary?.severityDistribution ?? [],
    [summary?.severityDistribution],
  );

  const sourceDistribution = useMemo(
    () => summary?.sourceDistribution ?? [],
    [summary?.sourceDistribution],
  );

  const epssDistribution = useMemo(
    () =>
      summary?.epssDistribution ?? {
        high: 0,
        medium: 0,
        low: 0,
        minimal: 0,
      },
    [summary?.epssDistribution],
  );

  const sourceOptions = useMemo(
    () => Array.from(new Set(sourceDistribution.map((item) => item.source))),
    [sourceDistribution],
  );

  const criticalCount = useMemo(
    () =>
      severityDistribution.find((entry) => entry.severity === "CRITICAL")?.count || 0,
    [severityDistribution],
  );

  const severityChartData = useMemo(
    () => toChartSeverityData(severityDistribution),
    [severityDistribution],
  );

  const exploitedCount = useMemo(() => {
    if (typeof summary?.exploitedCount === "number") {
      return summary.exploitedCount;
    }
    return vulns.filter((item) => item.isExploited).length;
  }, [summary?.exploitedCount, vulns]);

  const openOnPage = useMemo(
    () =>
      vulns.filter((item) => item.status === "OPEN" || item.status === "IN_PROGRESS")
        .length,
    [vulns],
  );

  const highestSourceCount = useMemo(
    () => Math.max(1, ...sourceDistribution.map((item) => item.count)),
    [sourceDistribution],
  );

  if (isLoading && vulns.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <ShieldLoader size="lg" variant="cyber" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <PageHeader
          title="Vulnerabilities"
          description="Prioritize and remediate the highest-impact findings with clearer operational context for SOC and engineering teams."
          badge={
            <>
              <Sparkles size={13} className="mr-2" />
              Vulnerability Triage Workspace
            </>
          }
          actions={
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => void exportData("csv")}
                className="btn btn-secondary !px-4 !py-2.5"
              >
                <Download size={14} className="mr-2" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => void exportData("xlsx")}
                className="btn btn-secondary !px-4 !py-2.5"
              >
                <Download size={14} className="mr-2" />
                XLSX
              </button>
              <button
                type="button"
                className="btn btn-secondary !px-4 !py-2.5"
              >
                <TrendingUp size={14} className="mr-2" />
                Import Scan
              </button>
              <Link
                href="/vulnerabilities/remediation"
                className="btn btn-secondary !px-4 !py-2.5"
              >
                <TrendingUp size={14} className="mr-2" />
                Remediation
              </Link>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary !px-5 !py-2.5"
              >
                <Plus size={14} className="mr-2" />
                Add Vulnerability
              </button>
            </div>
          }
          stats={[
            {
              label: "Total tracked",
              value: numberFormatter.format(pagination.total),
              icon: Shield,
              trend: { value: `${pagination.totalPages} pages`, neutral: true }
            },
            {
              label: "Critical Findings",
              value: numberFormatter.format(criticalCount),
              icon: AlertTriangle,
              trend: { value: "Priority", isUp: false }
            },
            {
              label: "Exploited Risks",
              value: numberFormatter.format(exploitedCount),
              icon: Zap,
              trend: { value: "Live threats", isUp: false }
            },
            {
              label: "Open on Page",
              value: numberFormatter.format(openOnPage),
              icon: Filter,
              trend: { value: "Active triage", neutral: true }
            }
          ]}
        />

        {actionError ? (
          <section className="rounded-2xl border border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] p-3 text-sm text-[var(--badge-critical-text)]">
            {actionError}
          </section>
        ) : null}



        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
            <label className="relative block">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                placeholder="Search by CVE ID, title, or description"
                className="input h-10 w-full !pl-9 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border-[var(--border-color)] bg-[var(--bg-secondary)]"
              />
            </label>

            <select
              value={selectedSeverity}
              onChange={(event) => {
                setSelectedSeverity(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="input h-10 w-full appearance-none text-sm text-[var(--text-primary)] border-[var(--border-color)] bg-[var(--bg-secondary)]"
            >
              <option value="ALL">All Severities</option>
              {severityOptions.map((severity) => (
                <option key={severity} value={severity}>
                  {formatLabel(severity)}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="input h-10 w-full appearance-none text-sm text-[var(--text-primary)] border-[var(--border-color)] bg-[var(--bg-secondary)]"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>

            <select
              value={selectedSource}
              onChange={(event) => {
                setSelectedSource(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="input h-10 w-full appearance-none text-sm text-[var(--text-primary)] border-[var(--border-color)] bg-[var(--bg-secondary)]"
            >
              <option value="ALL">All Sources</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <select
              value={selectedWorkflow}
              onChange={(event) => {
                setSelectedWorkflow(event.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="input h-10 w-full appearance-none text-sm text-[var(--text-primary)] border-[var(--border-color)] bg-[var(--bg-secondary)]"
            >
              <option value="ALL">All Workflow</option>
              {workflowOptions.map((workflow) => (
                <option key={workflow} value={workflow}>
                  {formatLabel(workflow)}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => void fetchVulnerabilities({ silent: true })}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              >
                {isRefreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowExploited((prev) => !prev);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition",
                showExploited
                  ? "border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] text-[var(--badge-critical-text)]"
                  : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
              )}
            >
              <Zap size={13} />
              Exploited Only
            </button>
            <button
              type="button"
              onClick={() => {
                setShowKevOnly((prev) => !prev);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition",
                showKevOnly
                  ? "border-[var(--badge-high-border)] bg-[var(--badge-high-bg)] text-[var(--badge-high-text)]"
                  : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
              )}
            >
              CISA KEV Only
            </button>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] p-4 text-sm text-[var(--badge-critical-text)]">
            {error}
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <article className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
            <header className="flex flex-col gap-3 border-b border-[var(--border-color)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="type-section text-[var(--text-primary)]">Vulnerability Queue</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing {vulns.length} of {numberFormatter.format(pagination.total)} vulnerabilities
                </p>
              </div>
              <div className="type-caption text-[var(--text-muted)]">Page {pagination.page}</div>
            </header>

            {vulns.length === 0 ? (
              <div className="p-16 text-center">
                <Shield className="mx-auto h-12 w-12 text-[var(--text-muted)]" />
                <p className="mt-4 text-sm text-[var(--text-secondary)]">No vulnerabilities match current filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {vulns.map((vuln) => {
                  const severityTone =
                    severityColor[vuln.severity] || severityColor.INFORMATIONAL;
                  const statusTone = statusColor[vuln.status] || statusColor.OPEN;
                  const isExpanded = activeVulnId === vuln.id || (vuln.cveId && activeVulnId === vuln.cveId);
                  const workflowState = (vuln.workflowState || "NEW") as (typeof workflowOptions)[number];
                  const nextWorkflowStates = workflowTransitions[workflowState] || [];
                  const slaBadge = getSlaBadge(vuln.slaDueAt);

                  return (
                    <div
                      key={vuln.id}
                      className={cn(
                        "group p-4 transition hover:bg-[var(--bg-elevated)]",
                        isExpanded && "bg-[var(--bg-elevated)]",
                      )}
                    >
                      <div
                        className="flex cursor-pointer items-start gap-3"
                        onClick={() => setActiveVulnId(isExpanded ? null : vuln.id)}
                      >
                        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-2.5">
                          <Shield size={18} className="text-[var(--accent-1)]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {vuln.cveId ? (
                              <a
                                href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="type-mono inline-flex items-center gap-1 text-xs text-[var(--accent-1)] hover:text-[var(--accent-1-strong)]"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {vuln.cveId}
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="type-mono text-xs text-[var(--text-muted)]">No CVE ID</span>
                            )}

                            <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", severityTone)}>
                              {vuln.severity}
                            </span>

                            <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", statusTone)}>
                              {formatLabel(vuln.status)}
                            </span>

                            {vuln.workflowState ? (
                              <span className="rounded-full border border-[var(--line-3)] bg-[var(--accent-1-soft)] px-2 py-0.5 text-[11px] text-[var(--accent-1)]">
                                {formatLabel(vuln.workflowState)}
                              </span>
                            ) : null}

                            {vuln.isExploited ? (
                              <span className="rounded-full border border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] px-2 py-0.5 text-[11px] text-[var(--badge-critical-text)]">
                                EXPLOITED
                              </span>
                            ) : null}

                            {vuln.cisaKev ? (
                              <span className="rounded-full border border-[var(--badge-high-border)] bg-[var(--badge-high-bg)] px-2 py-0.5 text-[11px] text-[var(--badge-high-text)]">
                                CISA KEV
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mt-2 truncate text-sm font-medium text-[var(--text-primary)]">{vuln.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">
                            {vuln.description || "No description available."}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                              <span className="type-mono">
                                CVSS {typeof vuln.cvssScore === "number" ? vuln.cvssScore.toFixed(1) : "N/A"}
                              </span>
                              <span className="type-mono">
                                EPSS {typeof vuln.epssScore === "number" ? `${(vuln.epssScore * 100).toFixed(1)}%` : "N/A"}
                              </span>
                            <span>Source {vuln.source}</span>
                            {vuln.assignedUser?.name || vuln.assignedUser?.email ? (
                              <span>
                                Assignee {vuln.assignedUser?.name || vuln.assignedUser?.email}
                              </span>
                            ) : null}
                            {vuln.assignedTeam ? <span>Team {vuln.assignedTeam}</span> : null}
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[11px]",
                                slaBadge.tone,
                              )}
                            >
                              {slaBadge.label}
                            </span>
                          </div>

                        </div>

                        <div className="hidden text-right md:block">
                          <p className="text-sm font-semibold text-[var(--badge-high-text)]">
                            {vuln.affectedAssets || 0}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">Affected Assets</p>
                        </div>

                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveVulnId(isExpanded ? null : vuln.id)}
                            className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
                          >
                            <ChevronDown
                              size={14}
                              className={cn("transition-transform", isExpanded && "rotate-180")}
                            />
                          </button>
                          <VulnerabilityActions
                            vulnerability={vuln}
                            onEdit={() => setEditingVuln(vuln)}
                            onDelete={() => {
                              void handleDelete(vuln.id);
                            }}
                            isDeleting={deletingId === vuln.id}
                          />
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="mt-4 border-t border-[var(--border-color)] pt-4 pl-14">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-[var(--text-muted)]">
                              Workflow: {formatLabel(workflowState)}
                            </span>
                            {nextWorkflowStates.map((state) => (
                              <button
                                key={`${vuln.id}-${state}`}
                                type="button"
                                disabled={workflowUpdatingId === vuln.id}
                                onClick={() => void transitionWorkflow(vuln, state)}
                                className="inline-flex items-center gap-1 rounded-md border border-[var(--line-3)] bg-[var(--accent-1-soft)] px-2.5 py-1 text-[11px] text-[var(--accent-1)] transition hover:bg-[var(--accent-1-dim)] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {workflowUpdatingId === vuln.id ? "Updating..." : `Move to ${formatLabel(state)}`}
                              </button>
                            ))}
                            {!nextWorkflowStates.length ? (
                              <span className="text-xs text-[var(--text-muted)]">No further transitions.</span>
                            ) : null}
                          </div>
                          <RiskAssessmentView
                            riskEntry={vuln.riskEntries?.[0] as {
                              status?: string;
                              riskScore?: number;
                              impactScore?: number;
                              likelihoodScore?: number;
                              aiAnalysis?: Record<string, unknown>;
                              [key: string]: unknown;
                            } | null | undefined}
                            vulnerabilityId={vuln.id}
                            onRefresh={() => {
                              void fetchVulnerabilities({ silent: true });
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            <footer className="flex items-center justify-between border-t border-[var(--border-color)] p-4">
              <p className="text-xs text-[var(--text-muted)]">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || isLoading}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.totalPages, prev.page + 1),
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </footer>
          </article>

          <div className="space-y-4">
            <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Severity Distribution</h2>
              <div className="mt-4">
                {severityDistribution.length > 0 ? (
                  <>
                    <SeverityDistributionChart data={severityChartData} />
                    <div className="mt-4 space-y-2">
                      {severityDistribution.map((item) => (
                        <div key={item.severity} className="flex items-center justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">{item.severity}</span>
                          <span className="text-[var(--text-primary)]">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-muted)]">
                    No severity distribution data available.
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Source Distribution</h2>
              <div className="mt-4 space-y-3">
                {sourceDistribution.length > 0 ? (
                  sourceDistribution.map((item) => (
                    <div key={item.source}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-[var(--text-secondary)] font-mono">{item.source}</span>
                        <span className="text-[var(--text-muted)]">{item.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                        <div
                          className="h-full rounded-full bg-[var(--accent-1)]"
                          style={{
                            width: `${Math.min((item.count / highestSourceCount) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-muted)]">
                    No source distribution data available.
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">EPSS Ranges</h2>
              <div className="mt-4 space-y-2">
                {[
                  {
                    label: "High (>70%)",
                    value: epssDistribution.high,
                     tone: "text-[var(--badge-critical-text)] border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)]",
                  },
                  {
                    label: "Medium (30-70%)",
                    value: epssDistribution.medium,
                     tone: "text-[var(--badge-high-text)] border-[var(--badge-high-border)] bg-[var(--badge-high-bg)]",
                  },
                  {
                    label: "Low (10-30%)",
                    value: epssDistribution.low,
                     tone: "text-[var(--badge-medium-text)] border-[var(--badge-medium-border)] bg-[var(--badge-medium-bg)]",
                  },
                  {
                    label: "Minimal (<10%)",
                    value: epssDistribution.minimal,
                     tone: "text-[var(--badge-low-text)] border-[var(--badge-low-border)] bg-[var(--badge-low-bg)]",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                      item.tone,
                    )}
                  >
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>

      <AddVulnerabilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          void fetchVulnerabilities({ silent: true });
        }}
      />

      {editingVuln ? (
        <EditVulnerabilityModal
          isOpen={Boolean(editingVuln)}
          vulnerability={editingVuln}
          onClose={() => setEditingVuln(null)}
          onSuccess={() => {
            void fetchVulnerabilities({ silent: true });
          }}
        />
      ) : null}
    </DashboardLayout>
  );
}

export default function VulnerabilitiesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <ShieldLoader size="lg" variant="cyber" />
        </div>
      </DashboardLayout>
    }>
      <VulnerabilitiesContent />
    </Suspense>
  );
}
