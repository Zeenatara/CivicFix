import scene from "@/assets/civic-scene.jpg";
import { Camera, MapPin, Wrench, CheckCircle2 } from "lucide-react";

const chips = [
  { icon: Camera, label: "Notice", cls: "left-[2%] top-[12%]", delay: "0s" },
  { icon: MapPin, label: "Report", cls: "left-[38%] top-[2%]", delay: "1.2s" },
  { icon: Wrench, label: "Action", cls: "right-[2%] top-[38%]", delay: "2.4s" },
  { icon: CheckCircle2, label: "Improved", cls: "left-[8%] bottom-[8%]", delay: "3.6s" },
];

export function CivicIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="animate-glow pointer-events-none absolute left-[30%] top-[18%] h-24 w-24 rounded-full bg-highlight/40 blur-2xl" />
      <img src={scene} alt="Residents reporting a broken streetlight while a municipal worker repairs it" width={1280} height={1024} className="relative w-full mix-blend-multiply" />
      {chips.map(({ icon: Icon, label, cls, delay }) => (
        <div key={label} className={`animate-float absolute ${cls} flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-soft`} style={{ animationDelay: delay }}>
          <Icon className="h-3.5 w-3.5 text-primary" /> {label}
        </div>
      ))}
    </div>
  );
}
