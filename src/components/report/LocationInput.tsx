import { Crosshair, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LocationInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);

  const locate = () => {
    if (!navigator.geolocation) return toast.error("Location isn't available in this browser.");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        onChange(`Lat ${p.coords.latitude.toFixed(5)}, Lng ${p.coords.longitude.toFixed(5)}`);
        setBusy(false);
      },
      () => {
        toast.error("Couldn't get your location. Please type it instead.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Enter location or address" className="h-12 flex-1 rounded-xl border bg-card px-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
        <button type="button" onClick={locate} disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />} Use my location
        </button>
      </div>
      {value.trim() && (
        <div className="animate-rise flex items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-accent-foreground">{value}</span>
        </div>
      )}
    </div>
  );
}
