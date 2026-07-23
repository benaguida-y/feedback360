export default function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { c: string; label: string }> = {
        SUBMITTED: { c: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", label: "Soumis" },
        NOT_SUBMITTED: { c: "bg-amber-50 text-amber-700 ring-amber-600/20", label: "En attente" },
        IN_PROGRESS: { c: "bg-sky-50 text-sky-700 ring-sky-600/20", label: "En cours" },
    };
    const s = map[status] ?? { c: "bg-slate-100 text-slate-600 ring-slate-500/20", label: status };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.c}`}>{s.label}</span>;
}