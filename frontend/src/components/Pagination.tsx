import { ChevronLeft, ChevronRight } from "lucide-react";

// Contrôles de pagination (Précédent / Suivant + numéro de page).
export default function Pagination({ page, totalPages, onChange }: {
    page: number;          // index 0-based
    totalPages: number;
    onChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null;
    return (
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <button onClick={() => onChange(page - 1)} disabled={page === 0}
                    aria-label="Page précédente"
                    className="bg-white inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
                Précédent
            </button>
            <span className="text-xs bg-white rounded-lg px-3 py-1.5 font-medium border border-slate-300 flex items-center gap-1.5 text-slate-500">
                Page
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-brand px-1.5 text-xs font-semibold text-white">
                    {page + 1}
                </span>
                / {totalPages}
            </span>
            <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}
                    aria-label="Page suivante"
                    className="bg-white inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:opacity-40">
                Suivant
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}