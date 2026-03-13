/**
 * exportTAReport.ts
 * Professional multi-sheet Excel export for the Talent Acquisition Dashboard.
 * Uses SheetJS (xlsx) — already available in the project via CDN / npm.
 *
 * DROP-IN replacement for buildAndDownloadCSV in TADashboard.tsx.
 * Usage:
 *   import { exportTAReport } from "@/lib/exportTAReport";
 *   await exportTAReport(stats, allApplicants, jobs, reportFilters);
 */

import * as XLSX from "xlsx";

/* ─── Helpers ──────────────────────────────────────────────────── */

const BRAND_YELLOW = "FDF22F";
const BRAND_BLACK = "000000";
const GRAY_HEADER = "F3F4F6";
const GRAY_LIGHT = "F9FAFB";
const GREEN_LIGHT = "D1FAE5";
const RED_LIGHT = "FEE2E2";
const BLUE_LIGHT = "DBEAFE";
const AMBER_LIGHT = "FEF3C7";

function cell(
    value: string | number,
    opts: {
        bold?: boolean;
        bg?: string;
        fg?: string;
        align?: "left" | "center" | "right";
        italic?: boolean;
        size?: number;
        border?: boolean;
        wrap?: boolean;
    } = {}
): XLSX.CellObject {
    const style: any = {
        font: {
            bold: opts.bold ?? false,
            italic: opts.italic ?? false,
            color: { rgb: opts.fg ?? BRAND_BLACK },
            sz: opts.size ?? 10,
        },
        fill: opts.bg
            ? { patternType: "solid", fgColor: { rgb: opts.bg } }
            : undefined,
        alignment: {
            horizontal: opts.align ?? "left",
            vertical: "center",
            wrapText: opts.wrap ?? false,
        },
        border: opts.border
            ? {
                top: { style: "thin", color: { rgb: "E5E7EB" } },
                bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                left: { style: "thin", color: { rgb: "E5E7EB" } },
                right: { style: "thin", color: { rgb: "E5E7EB" } },
            }
            : undefined,
    };

    return { v: value, t: typeof value === "number" ? "n" : "s", s: style };
}

function sectionHeading(label: string, cols: number): XLSX.CellObject[] {
    const row: XLSX.CellObject[] = [
        cell(label, { bold: true, bg: BRAND_YELLOW, fg: BRAND_BLACK, size: 11, border: true }),
    ];
    for (let i = 1; i < cols; i++) row.push(cell("", { bg: BRAND_YELLOW }));
    return row;
}

function headerRow(labels: string[]): XLSX.CellObject[] {
    return labels.map((l) =>
        cell(l, { bold: true, bg: GRAY_HEADER, fg: BRAND_BLACK, border: true, align: "center" })
    );
}

function statusCell(status: string): XLSX.CellObject {
    const s = (status ?? "").toLowerCase().replace(/_/g, " ");
    const bg =
        s === "hired" ? GREEN_LIGHT :
            s === "rejected" ? RED_LIGHT :
                s === "offer" ? AMBER_LIGHT :
                    s.includes("interview") ? BLUE_LIGHT :
                        GRAY_LIGHT;
    return cell(s.toUpperCase(), { bold: true, bg, border: true, align: "center", size: 9 });
}

function colWidths(ws: XLSX.WorkSheet, widths: number[]): void {
    ws["!cols"] = widths.map((w) => ({ wch: w }));
}

function rowHeights(ws: XLSX.WorkSheet, heights: { [row: number]: number }): void {
    if (!ws["!rows"]) ws["!rows"] = [];
    Object.entries(heights).forEach(([r, h]) => {
        (ws["!rows"] as any[])[Number(r)] = { hpt: h };
    });
}

function merge(ws: XLSX.WorkSheet, s: XLSX.Range): void {
    if (!ws["!merges"]) ws["!merges"] = [];
    ws["!merges"].push(s);
}

const PERIOD_MAP: Record<string, string> = {
    "7": "Last 7 Days",
    "30": "Last 30 Days",
    "90": "Last 90 Days",
    "365": "Last Year",
    "All": "All Time",
};

function periodLabel(dateRange: string): string {
    return PERIOD_MAP[dateRange] ?? dateRange;
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 1 — Cover / Summary
══════════════════════════════════════════════════════════════════ */
function buildCoverSheet(stats: any, reportFilters: any, now: string): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const rows: XLSX.CellObject[][] = [];

    const dept =
        reportFilters.department === "All" ? "All Departments" : reportFilters.department;

    rows.push([
        cell("TALENT ACQUISITION REPORT", { bold: true, bg: BRAND_BLACK, fg: BRAND_YELLOW, size: 16, align: "center" }),
        ...Array(5).fill(cell("", { bg: BRAND_BLACK })),
    ]);
    rows.push([
        cell("DROGA PHARMA — TA TEAM", { bold: true, bg: BRAND_BLACK, fg: "FFFFFF", size: 11, align: "center" }),
        ...Array(5).fill(cell("", { bg: BRAND_BLACK })),
    ]);
    rows.push([cell("", { bg: BRAND_BLACK }), ...Array(5).fill(cell("", { bg: BRAND_BLACK }))]);

    rows.push([
        cell("Generated On", { bold: true, bg: GRAY_LIGHT, border: true }),
        cell(now, { bg: GRAY_LIGHT, border: true }),
        cell(""),
        cell("Reporting Period", { bold: true, bg: GRAY_LIGHT, border: true }),
        cell(periodLabel(reportFilters.dateRange), { bg: GRAY_LIGHT, border: true }),
        cell(""),
    ]);
    rows.push([
        cell("Department Filter", { bold: true, bg: GRAY_LIGHT, border: true }),
        cell(dept, { bg: GRAY_LIGHT, border: true }),
        cell(""),
        cell("Exported By", { bold: true, bg: GRAY_LIGHT, border: true }),
        cell("TA Team Dashboard", { bg: GRAY_LIGHT, border: true }),
        cell(""),
    ]);
    rows.push([cell(""), cell(""), cell(""), cell(""), cell(""), cell("")]);

    rows.push(sectionHeading("  KEY PERFORMANCE INDICATORS", 6));
    rows.push(headerRow(["Metric", "Value", "", "Metric", "Value", ""]));

    const kpis: [string, any, string, any][] = [
        ["Total Employees (Headcount)", stats?.metrics?.total_employees ?? 0,
            "Active Job Openings", stats?.metrics?.active_jobs ?? 0],
        ["Active Applicants in Pipeline", stats?.funnel?.applied ?? 0,
            "Avg. Time to Hire (Days)", stats?.avg_time_to_hire ?? 0],
        ["Total Hired (Period)", stats?.funnel?.hired ?? 0,
            "Total Offered (Period)", stats?.funnel?.offer ?? 0],
        ["Retention Rate (%)", stats?.metrics?.retention_rate ?? 0,
            "Rejection Rate (%)",
            stats?.funnel?.applied > 0
                ? Math.round(((stats?.funnel?.rejected ?? 0) / stats.funnel.applied) * 100)
                : 0],
    ];

    kpis.forEach(([l1, v1, l2, v2]) => {
        rows.push([
            cell(l1, { border: true }),
            cell(v1, { bold: true, border: true, align: "center" }),
            cell(""),
            cell(l2, { border: true }),
            cell(v2, { bold: true, border: true, align: "center" }),
            cell(""),
        ]);
    });

    rows.push([cell(""), cell(""), cell(""), cell(""), cell(""), cell("")]);
    rows.push(sectionHeading("  HIRING FUNNEL", 6));
    rows.push(headerRow(["Stage", "Count", "% of Applied", "Stage Progress", "", ""]));

    const ap = stats?.funnel?.applied || 1;
    const funnelStages = [
        { label: "Applied", count: stats?.funnel?.applied ?? 0 },
        { label: "Screening", count: stats?.funnel?.screening ?? 0 },
        { label: "Interviewing", count: stats?.funnel?.interviewing ?? 0 },
        { label: "Offered", count: stats?.funnel?.offer ?? 0 },
        { label: "Hired", count: stats?.funnel?.hired ?? 0 },
        { label: "Rejected", count: stats?.funnel?.rejected ?? 0 },
    ];

    funnelStages.forEach((s) => {
        const pct = Math.round((s.count / ap) * 100);
        const bar = "█".repeat(Math.round(pct / 5)) + "░".repeat(20 - Math.round(pct / 5));
        rows.push([
            cell(s.label, { border: true }),
            cell(s.count, { bold: true, border: true, align: "center" }),
            cell(`${pct}%`, { border: true, align: "center" }),
            cell(bar, { border: true, size: 8, fg: "374151" }),
            cell(""),
            cell(""),
        ]);
    });

    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    merge(ws, { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });
    merge(ws, { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });
    merge(ws, { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } });
    colWidths(ws, [30, 18, 3, 30, 18, 4]);
    rowHeights(ws, { 0: 36, 1: 22, 6: 5 });

    return ws;
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 2 — Applicant Roster
══════════════════════════════════════════════════════════════════ */
function buildApplicantsSheet(applicants: any[]): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const rows: XLSX.CellObject[][] = [];

    rows.push(sectionHeading("  APPLICANT ROSTER", 10));
    rows.push(headerRow([
        "#", "Full Name", "Email", "Phone",
        "Position Applied", "Department", "Experience (Yrs)",
        "Status", "Applied On", "Hired On",
    ]));

    applicants.forEach((a, idx) => {
        rows.push([
            cell(idx + 1, { border: true, align: "center" }),
            cell(a.name ?? "—", { bold: true, border: true }),
            cell(a.email ?? "—", { border: true }),
            cell(a.phone ?? "—", { border: true }),
            cell(a.job_posting?.title ?? a.jobPosting?.title ?? "—", { border: true }),
            cell(a.job_posting?.department ?? a.jobPosting?.department ?? "—", { border: true }),
            cell(a.years_of_experience ?? "—", { border: true, align: "center" }),
            statusCell((a.status ?? "new").toLowerCase()),
            cell(a.created_at ? new Date(a.created_at).toLocaleDateString("en-US") : "—", { border: true, align: "center" }),
            cell(a.hired_at ? new Date(a.hired_at).toLocaleDateString("en-US") : "—", { border: true, align: "center", fg: a.hired_at ? "065F46" : "9CA3AF" }),
        ]);
    });

    if (!applicants.length) {
        rows.push([cell("No applicant records found.", { italic: true, fg: "9CA3AF" }), ...Array(9).fill(cell(""))]);
    }

    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    colWidths(ws, [5, 22, 28, 14, 26, 20, 14, 16, 14, 14]);
    rowHeights(ws, { 0: 22, 1: 18 });
    ws["!freeze"] = { xSplit: 0, ySplit: 2 } as any;

    return ws;
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 3 — Active Job Postings
══════════════════════════════════════════════════════════════════ */
function buildJobsSheet(jobs: any[]): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const rows: XLSX.CellObject[][] = [];

    rows.push(sectionHeading("  ACTIVE JOB POSTINGS", 7));
    rows.push(headerRow(["#", "Job Title", "Department", "Location", "Status", "Applicants", "Deadline"]));

    jobs.forEach((j, idx) => {
        const status = (j.status ?? "").toLowerCase();
        const statusBg =
            status === "active" ? GREEN_LIGHT :
                status === "closed" ? RED_LIGHT : GRAY_LIGHT;

        rows.push([
            cell(idx + 1, { border: true, align: "center" }),
            cell(j.title ?? "—", { bold: true, border: true }),
            cell(j.department ?? j.requisition?.department ?? "—", { border: true }),
            cell(j.location ?? "—", { border: true }),
            cell(status.toUpperCase(), { bold: true, bg: statusBg, border: true, align: "center", size: 9 }),
            cell(j.applicants_count ?? 0, { border: true, align: "center" }),
            cell(j.deadline ? new Date(j.deadline).toLocaleDateString("en-US") : "—", { border: true, align: "center" }),
        ]);
    });

    if (!jobs.length) {
        rows.push([cell("No job postings found.", { italic: true, fg: "9CA3AF" }), ...Array(6).fill(cell(""))]);
    }

    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    colWidths(ws, [5, 30, 22, 18, 12, 12, 14]);
    rowHeights(ws, { 0: 22, 1: 18 });
    ws["!freeze"] = { xSplit: 0, ySplit: 2 } as any;

    return ws;
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 4 — Monthly Application Volume
══════════════════════════════════════════════════════════════════ */
function buildTimelineSheet(stats: any): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const rows: XLSX.CellObject[][] = [];
    const timeline: { label: string; count: number }[] = stats?.timeline ?? [];
    const peak = Math.max(...timeline.map((t) => t.count), 1);

    rows.push(sectionHeading("  MONTHLY APPLICATION VOLUME", 4));
    rows.push(headerRow(["Month", "Applications", "Trend", "% of Peak"]));

    timeline.forEach((t, idx) => {
        const pct = Math.round((t.count / peak) * 100);
        const prev = idx > 0 ? timeline[idx - 1].count : t.count;
        const trend = t.count > prev ? "▲ Up" : t.count < prev ? "▼ Down" : "→ Flat";
        const trendFg = t.count > prev ? "065F46" : t.count < prev ? "991B1B" : "374151";

        rows.push([
            cell(t.label, { border: true }),
            cell(t.count, { bold: true, border: true, align: "center" }),
            cell(trend, { border: true, align: "center", fg: trendFg, bold: true, size: 9 }),
            cell(`${pct}%`, { border: true, align: "center" }),
        ]);
    });

    if (!timeline.length) {
        rows.push([cell("No monthly data available.", { italic: true, fg: "9CA3AF" }), ...Array(3).fill(cell(""))]);
    }

    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    colWidths(ws, [18, 16, 14, 14]);
    rowHeights(ws, { 0: 22, 1: 18 });

    return ws;
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 5 — Department Breakdown + Sources
══════════════════════════════════════════════════════════════════ */
function buildDepartmentSheet(stats: any): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const rows: XLSX.CellObject[][] = [];
    const depts: { department: string; count: number }[] = stats?.by_department ?? [];
    const total = depts.reduce((s, d) => s + d.count, 0) || 1;

    rows.push(sectionHeading("  APPLICANTS BY DEPARTMENT", 4));
    rows.push(headerRow(["Department", "Applicants", "Share (%)", "Visual"]));

    depts.forEach((d) => {
        const pct = Math.round((d.count / total) * 100);
        rows.push([
            cell(d.department, { border: true }),
            cell(d.count, { bold: true, border: true, align: "center" }),
            cell(`${pct}%`, { border: true, align: "center" }),
            cell("█".repeat(Math.round(pct / 5)), { border: true, size: 9, fg: BRAND_BLACK }),
        ]);
    });

    if (!depts.length) {
        rows.push([cell("No department data available.", { italic: true, fg: "9CA3AF" }), ...Array(3).fill(cell(""))]);
    }

    rows.push([cell(""), cell(""), cell(""), cell("")]);
    rows.push(sectionHeading("  APPLICATION SOURCE ATTRIBUTION", 4));
    rows.push(headerRow(["Source Channel", "Applications", "Share (%)", "Visual"]));

    const sources: { source: string; count: number }[] = stats?.sources ?? [];
    const st = sources.reduce((s, d) => s + d.count, 0) || 1;

    sources.forEach((s) => {
        const pct = Math.round((s.count / st) * 100);
        rows.push([
            cell(s.source || "Direct / Unknown", { border: true }),
            cell(s.count, { bold: true, border: true, align: "center" }),
            cell(`${pct}%`, { border: true, align: "center" }),
            cell("█".repeat(Math.round(pct / 5)), { border: true, size: 9, fg: "374151" }),
        ]);
    });

    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    colWidths(ws, [28, 14, 14, 24]);
    rowHeights(ws, { 0: 22, 1: 18 });

    return ws;
}

/* ═══════════════════════════════════════════════════════════════
   SHEET 6 — Turnover Analysis
══════════════════════════════════════════════════════════════════ */
function buildTurnoverSheet(stats: any): XLSX.WorkSheet {
    const ws: XLSX.WorkSheet = {};
    const rows: XLSX.CellObject[][] = [];
    const turnover: any[] = stats?.turnover ?? [];

    rows.push(sectionHeading("  EMPLOYEE TURNOVER ANALYSIS", 6));
    rows.push(headerRow(["Month", "Turnover Rate (%)", "Resigned", "Terminated", "Total Separations", "Risk Level"]));

    turnover.forEach((t) => {
        const risk = t.rate > 5 ? "HIGH RISK" : t.rate > 2 ? "MODERATE" : t.rate > 0 ? "LOW" : "STABLE";
        const riskBg = t.rate > 5 ? RED_LIGHT : t.rate > 2 ? AMBER_LIGHT : t.rate > 0 ? BLUE_LIGHT : GREEN_LIGHT;

        rows.push([
            cell(t.full_label ?? t.label, { border: true }),
            cell(`${t.rate}%`, { bold: true, border: true, align: "center" }),
            cell(t.resigned, { border: true, align: "center", fg: "065F46" }),
            cell(t.terminated, { border: true, align: "center", fg: "991B1B" }),
            cell(t.total, { bold: true, border: true, align: "center" }),
            cell(risk, { bold: true, bg: riskBg, border: true, align: "center", size: 9 }),
        ]);
    });

    if (!turnover.length) {
        rows.push([cell("No turnover data available.", { italic: true, fg: "9CA3AF" }), ...Array(5).fill(cell(""))]);
    }

    XLSX.utils.sheet_add_aoa(ws, rows, { origin: "A1" });
    colWidths(ws, [18, 18, 12, 14, 20, 14]);
    rowHeights(ws, { 0: 22, 1: 18 });

    return ws;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT FUNCTION
══════════════════════════════════════════════════════════════════ */
export async function exportTAReport(
    stats: any,
    allApplicants: any[],
    jobs: any[],
    reportFilters: { dateRange: string; department: string; jobId: string }
): Promise<void> {
    const wb = XLSX.utils.book_new();
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    XLSX.utils.book_append_sheet(wb, buildCoverSheet(stats, reportFilters, now), "📊 Summary");
    XLSX.utils.book_append_sheet(wb, buildApplicantsSheet(allApplicants), "👥 Applicants");
    XLSX.utils.book_append_sheet(wb, buildJobsSheet(jobs), "💼 Job Postings");
    XLSX.utils.book_append_sheet(wb, buildTimelineSheet(stats), "📅 Monthly Volume");
    XLSX.utils.book_append_sheet(wb, buildDepartmentSheet(stats), "🏢 Departments & Sources");
    XLSX.utils.book_append_sheet(wb, buildTurnoverSheet(stats), "📉 Turnover");

    const period = periodLabel(reportFilters.dateRange).replace(/\s+/g, "_");
    const date = new Date().toISOString().slice(0, 10);
    const filename = `TA_Report_DrogaPharma_${period}_${date}.xlsx`;

    XLSX.writeFile(wb, filename, { bookType: "xlsx", type: "binary", cellStyles: true });
}






