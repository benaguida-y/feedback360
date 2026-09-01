import Skeleton from "./Skeleton";

// Placeholder d'un graphe pendant le chargement : même carte, titre + zone grise animée.
export default function ChartSkeleton() {
    return (
        <div className="chart-card">
            <Skeleton className="chart-skeleton-title" />
            <Skeleton className="chart-skeleton-body" />
        </div>
    );
}