import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function NavCard({ to, title, subtitle }: { to: string; title: string; subtitle: string }) {
    return (
        <Link to={to} className="nav-card">
            <div>
                <p className="nav-card-title">{title}</p>
                <p className="nav-card-subtitle">{subtitle}</p>
            </div>
            <ChevronRight className="nav-card-chevron" />
        </Link>
    );
}
