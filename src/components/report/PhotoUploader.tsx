import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export function PhotoUploader({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const read = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // Downscale to keep storage light.
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale;
      c.height = img.height * scale;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      onChange(c.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const input = <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { read(e.target.files?.[0]); e.target.value = ""; }} />;

  if (value)
    return (
      <div className="animate-rise overflow-hidden rounded-2xl border bg-card">
        {input}
        <img src={value} alt="Evidence preview" className="max-h-80 w-full object-cover" />
        <div className="flex gap-2 p-3">
          <button type="button" onClick={() => ref.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"><RefreshCw className="h-4 w-4" /> Replace</button>
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Remove</button>
        </div>
      </div>
    );

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files[0]); }}
      className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${drag ? "border-primary bg-primary-soft" : "border-input hover:border-primary/60 hover:bg-muted/50"}`}
    >
      {input}
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary"><ImagePlus className="h-5 w-5" /></span>
      <span className="font-medium">Drop a photo here or click to upload</span>
      <span className="text-sm text-muted-foreground">One image · JPG, PNG or HEIC</span>
    </button>
  );
}
