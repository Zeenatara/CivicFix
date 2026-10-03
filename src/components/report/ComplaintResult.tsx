import { Check, Copy, Download, Pencil, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { categoryLabel, type Report } from "@/lib/reports";
import { CATEGORY_ICONS } from "./CategorySelector";

export function ComplaintResult({ report, onChange, onEdit }: { report: Report; onChange: (text: string) => void; onEdit: () => void }) {
  const [copied, setCopied] = useState(false);
  const Icon = CATEGORY_ICONS[report.category];

  const copy = async () => {
    await navigator.clipboard.writeText(report.complaint);
    setCopied(true);
    toast.success("Complaint copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const download = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth() - 112;
    let y = 64;
    doc.setFont("helvetica", "bold").setFontSize(18).text("CivicFix Complaint", 56, y);
    y += 28;
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(110);
    doc.text(`Category: ${categoryLabel(report.category)}   ·   Location: ${report.location}`, 56, y, { maxWidth: w });
    y += 28;
    doc.setTextColor(30).setFontSize(11);
    const lines = doc.splitTextToSize(report.complaint, w);
    doc.text(lines, 56, y);
    y += lines.length * 15 + 20;
    if (report.photo) {
      const props = doc.getImageProperties(report.photo);
      const h = Math.min(300, (w * props.height) / props.width);
      const iw = (h * props.width) / props.height;
      if (y + h > doc.internal.pageSize.getHeight() - 56) { doc.addPage(); y = 56; }
      doc.addImage(report.photo, "JPEG", 56, y, iw, h);
    }
    doc.save(`civicfix-complaint-${report.id.slice(0, 6)}.pdf`);
  };

  return (
    <div className="animate-rise space-y-8">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground"><Check className="h-3.5 w-3.5" /> Draft saved to My Reports</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Your complaint is <span className="font-display text-5xl font-normal italic text-primary">ready</span></h1>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-[1fr_1fr]">
        <div className="bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</p>
          <p className="mt-1.5 flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-primary" /> {categoryLabel(report.category)}</p>
        </div>
        <div className="bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</p>
          <p className="mt-1.5 flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 shrink-0 text-primary" /> {report.location}</p>
        </div>
        <div className="flex gap-4 bg-card p-5 sm:col-span-2">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Issue</p>
            <p className="mt-1.5 leading-relaxed">{report.description}</p>
          </div>
          {report.photo && <img src={report.photo} alt="Evidence" className="h-20 w-20 rounded-lg object-cover" />}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Complaint</h2>
        <textarea value={report.complaint} onChange={(e) => onChange(e.target.value)} rows={16}
          className="w-full rounded-2xl border bg-card p-5 leading-relaxed shadow-soft outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
        <p className="mt-2 text-xs text-muted-foreground">You can edit the text above before copying or downloading.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={copy} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lift transition hover:-translate-y-0.5">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy Complaint"}
        </button>
        <button onClick={download} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-card px-6 font-medium transition hover:border-primary hover:text-primary"><Download className="h-4 w-4" /> Download PDF</button>
        <button onClick={onEdit} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /> Edit Report</button>
      </div>
    </div>
  );
}
