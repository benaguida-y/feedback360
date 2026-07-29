import { Link } from "react-router-dom";

// Carte cliquable "titre + sous-titre + flèche", partagée par les dashboards.
export default function NavCard({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
    return (
        <Link to={to}
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow">
            <div>
                <p className="font-semibold text-slate-800">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand">
                <path fillRule="evenodd" d="M7 4l6 6-6 6-1.4-1.4L10.2 10 5.6 5.4 7 4z" clipRule="evenodd" />
            </svg>
        </Link>
    );
}