import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { modules, alerts } from "@/services/mockData";

const regions = ["Brazil", "India", "Indonesia", "DR Congo", "China", "Nigeria", "Bangladesh", "Pakistan", "Mexico", "Australia", "California", "Punjab", "Assam", "Delhi", "Shanghai"];

interface SearchResult {
  type: "module" | "region" | "alert";
  label: string;
  path: string;
  sub?: string;
}

const SearchDropdown = () => {
  const { searchQuery, setSearchQuery } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = searchQuery.toLowerCase();
  const results: SearchResult[] = [];

  if (q.length > 0) {
    modules.filter((m) => m.title.toLowerCase().includes(q)).forEach((m) => {
      results.push({ type: "module", label: m.title, path: m.path, sub: "Module" });
    });
    regions.filter((r) => r.toLowerCase().includes(q)).forEach((r) => {
      results.push({ type: "region", label: r, path: "/dashboard", sub: "Region" });
    });
    alerts.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 3).forEach((a) => {
      results.push({ type: "alert", label: a.title, path: "/alerts", sub: `Alert · ${a.severity}` });
    });
  }

  const go = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          data-search-input
          placeholder="Search… (press /)"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) go(results[0].path);
            if (e.key === "Escape") { setSearchQuery(""); setOpen(false); }
          }}
          className="border-0 bg-transparent h-auto p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground w-48"
        />
        <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">/</kbd>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
          {results.slice(0, 8).map((r, i) => (
            <button
              key={i}
              onClick={() => go(r.path)}
              className="flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-secondary/80 transition-colors"
            >
              <div>
                <p className="text-sm text-foreground">{r.label}</p>
                <p className="text-[10px] text-muted-foreground">{r.sub}</p>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      {open && q.length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-popover border border-border rounded-lg shadow-xl z-50 p-4 text-center animate-fade-in">
          <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
