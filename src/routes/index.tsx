import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CivicIllustration } from "@/components/CivicIllustration";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicFix — Fix what matters. Report what you see." },
      { name: "description", content: "Turn everyday civic problems into clear, actionable complaints in minutes." },
      { property: "og:title", content: "CivicFix — Fix what matters" },
      { property: "og:description", content: "Turn everyday civic problems into clear, actionable complaints." },
    ],
  }),
  component: Index,
});

const steps = [
  ["01", "Describe", "Tell us what you noticed in your own words."],
  ["02", "Add details", "Attach a photo, a location and a category."],
  ["03", "Get your complaint", "A clear, formal complaint — ready to send."],
];

function Index() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-[1fr_1.1fr] md:pt-20">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> For residents, by residents
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Fix what matters.
            <br />
            <span className="font-display text-5xl font-normal italic text-primary sm:text-7xl">Report what you see.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">Turn everyday civic problems into clear, actionable complaints.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/report" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lift transition hover:-translate-y-0.5">
              Report an Issue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/reports" className="inline-flex h-12 items-center justify-center rounded-xl border bg-card px-6 font-medium transition hover:border-primary hover:text-primary">My Reports</Link>
          </div>
        </div>
        <CivicIllustration />
      </section>

      <section className="border-t bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          {steps.map(([n, t, d]) => (
            <div key={n}>
              <p className="font-display text-3xl italic text-primary">{n}</p>
              <p className="mt-2 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
