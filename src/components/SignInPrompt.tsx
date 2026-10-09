import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

export function SignInPrompt({ text }: { text: string }) {
  return (
    <div className="animate-rise mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary"><LogIn className="h-6 w-6" /></span>
      <h2 className="mt-4 text-lg font-semibold">Sign in to continue</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      <Link to="/auth" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground shadow-lift transition hover:-translate-y-0.5">Sign in</Link>
    </div>
  );
}
