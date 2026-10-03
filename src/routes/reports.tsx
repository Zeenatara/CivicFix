import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { categoryLabel, listReports, type Report } from "@/lib/reports";
import { CATEGORY_ICONS } from "@/components/report/CategorySelector";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "My Reports — CivicFix" },
      { name: "description", content: "Revisit the civic complaints you've drafted with CivicFix." },
      { property: "og:title", content: "My Reports — CivicFix" },
      { property: "og:description", content: "Your drafted civic complaints in one place." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [reports, setReports] = useState<Report[] | null>(null);
  useEffect(() => setReports(listReports()), []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">My Reports</h1>
      <p className="mt-1 text-muted-foreground">Saved on this device.</p>

      {reports && reports.length === 0 && (
        <div className="animate-rise mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary"><FileText className="h-6 w-6" /></span>
          <h2 className="mt-4 text-lg font-semibold">No reports yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your submitted reports will appear here.</p>
          <Link to="/report" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground shadow-lift transition hover:-translate-y-0.5">Report an Issue</Link>
        </div>
      )}

      {reports && reports.length > 0 && (
        <ul className="mt-8 divide-y overflow-hidden rounded-2xl border bg-card shadow-soft">
          {reports.map((r, i) => {
            const Icon = CATEGORY_ICONS[r.category];
            return (
              <li key={r.id} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <Link to="/report" search={{ id: r.id }} className="group flex items-center gap-4 p-5 transition hover:bg-muted/50">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{categoryLabel(r.category)}</span>·
                      <span>{new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{r.status}</span>
                    </div>
                    <p className="mt-1 truncate font-medium">{r.description}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" /> {r.location}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
