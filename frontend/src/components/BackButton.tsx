import { useNavigate } from "react-router-dom";
import {ChevronLeft} from "lucide-react";

export default function BackButton({ to = "/" }: { to?: string }) {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            onClick={() => navigate(to)}
            aria-label="Retour au tableau de bord"
            className="flex h-10 w-10 flex-none items-center justify-center border border-slate-300 bg-white text-slate-500 transition hover:border-brand hover:text-brand"
        >
            <ChevronLeft className="h-4 w-4" />
        </button>
    );
}
