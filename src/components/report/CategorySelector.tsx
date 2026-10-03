import { Construction, Lightbulb, Trash, Droplets, Landmark, CircleHelp, type LucideIcon } from "lucide-react";
import { CATEGORIES, type CategoryId } from "@/lib/reports";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  road: Construction, streetlight: Lightbulb, garbage: Trash, water: Droplets, property: Landmark, other: CircleHelp,
};

export function CategorySelector({ value, onChange }: { value: CategoryId | null; onChange: (v: CategoryId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {CATEGORIES.map(({ id, label }) => {
        const Icon = CATEGORY_ICONS[id];
        const on = value === id;
        return (
          <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={on}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${on ? "border-primary bg-primary-soft text-accent-foreground ring-4 ring-primary/10" : "bg-card hover:border-primary/50"}`}>
            <Icon className={`h-5 w-5 shrink-0 ${on ? "text-primary" : "text-muted-foreground"}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
