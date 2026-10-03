import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const linkCls = "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
const activeCls = "!text-foreground bg-muted";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12l4 4 10-10" /></svg>
          </span>
          CivicFix
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          <Link to="/report" className={linkCls} activeProps={{ className: activeCls }}>Report an Issue</Link>
          <Link to="/reports" className={linkCls} activeProps={{ className: activeCls }}>My Reports</Link>
        </div>
        <button className="rounded-lg p-2 sm:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="animate-rise flex flex-col gap-1 border-t px-5 py-3 sm:hidden">
          <Link to="/report" className={linkCls} onClick={() => setOpen(false)}>Report an Issue</Link>
          <Link to="/reports" className={linkCls} onClick={() => setOpen(false)}>My Reports</Link>
        </div>
      )}
    </header>
  );
}
