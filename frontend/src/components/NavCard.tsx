import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function NavCard({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
    return (
        <Link to={to}
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow dark:border-cap-border dark:bg-cap-panel dark:hover:border-brand">
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand dark:text-slate-500" />
        </Link>
    );
}