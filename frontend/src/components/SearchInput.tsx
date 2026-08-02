import { Search } from "lucide-react";

// Search input component (icon + input), used in lists.
export default function SearchInput({ value, onChange, placeholder = "Rechercher…" }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="relative w-72">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
            </span>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                   className="w-full rounded-lg border bg-white border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </div>
    );
}