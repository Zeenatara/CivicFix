import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { PhotoUploader } from "@/components/report/PhotoUploader";
import { LocationInput } from "@/components/report/LocationInput";
import { CategorySelector } from "@/components/report/CategorySelector";
import { ComplaintResult } from "@/components/report/ComplaintResult";
import { generateComplaint, getReport, saveReport, type CategoryId, type Report } from "@/lib/reports";

export const Route = createFileRoute("/report")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => (typeof s["id"] === "string" ? { id: s["id"] } : {}),
  head: () => ({
    meta: [
      { title: "Report an Issue — CivicFix" },
      { name: "description", content: "Describe a civic problem, add a photo and location, and generate a clear complaint." },
      { property: "og:title", content: "Report an Issue — CivicFix" },
      { property: "og:description", content: "Generate a clear, structured civic complaint in minutes." },
    ],
  }),
  component: ReportPage,
});

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-baseline gap-3 text-xl font-semibold tracking-tight">
        <span className="font-display text-2xl font-normal italic text-primary">{n}</span>{title}
      </h2>
      {children}
    </section>
  );
}

function Progress({ step }: { step: number }) {
  const items = ["Report", "Details", "Complaint"];
  return (
    <ol className="mb-10 flex items-center gap-2 text-sm">
      {items.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span className={`font-mono text-xs ${i <= step ? "text-primary" : "text-muted-foreground"}`}>0{i + 1}</span>
          <span className={`font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
          {i < 2 && <span className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
        </li>
      ))}
    </ol>
  );
}

function ReportPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [reportId, setReportId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [result, setResult] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const r = getReport(id);
    if (!r) return;
    setReportId(r.id); setCreatedAt(r.createdAt); setDescription(r.description); setPhoto(r.photo);
    setLocation(r.location); setCategory(r.category); setResult(r);
  }, [id]);

  const step = result ? 2 : description.trim() ? 1 : 0;
  const ready = description.trim().length > 5 && location.trim() && category;

  const generate = async () => {
    if (!ready) return;
    setLoading(true);
    const complaint = await generateComplaint({ description, location, category: category!, hasPhoto: !!photo });
    const r: Report = {
      id: reportId ?? crypto.randomUUID(), description: description.trim(), photo, location: location.trim(),
      category: category!, complaint, status: "Draft", createdAt: createdAt ?? new Date().toISOString(),
    };
    saveReport(r);
    setReportId(r.id); setCreatedAt(r.createdAt); setResult(r); setLoading(false);
    navigate({ to: "/report", search: { id: r.id }, replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateComplaint = (text: string) => {
    if (!result) return;
    const r = { ...result, complaint: text };
    setResult(r); saveReport(r);
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <Progress step={step} />
      {result ? (
        <ComplaintResult report={result} onChange={updateComplaint} onEdit={() => { setResult(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      ) : (
        <div className="animate-rise space-y-12">
          <Section n="a." title="What problem did you notice?">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              placeholder="Example: The streetlight near the college gate has not been working for the past week."
              className="w-full rounded-2xl border bg-card p-5 text-base leading-relaxed shadow-soft outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15" />
          </Section>
          <Section n="b." title="Add photo evidence"><PhotoUploader value={photo} onChange={setPhoto} /></Section>
          <Section n="c." title="Where is the issue?"><LocationInput value={location} onChange={setLocation} /></Section>
          <Section n="d." title="What type of issue is this?"><CategorySelector value={category} onChange={setCategory} /></Section>

          <div className="border-t pt-8">
            <button onClick={generate} disabled={!ready || loading}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Drafting your complaint…</> : <><Sparkles className="h-5 w-5" /> Generate Complaint</>}
            </button>
            {!ready && <p className="mt-3 text-center text-sm text-muted-foreground">Add a description, location and category to continue.</p>}
          </div>
        </div>
      )}
    </main>
  );
}
