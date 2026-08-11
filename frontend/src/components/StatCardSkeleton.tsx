import Skeleton from "./Skeleton";

export default function StatCardSkeleton() {
    return (
        <div className="stat-card">
            <Skeleton className="stat-skeleton-label" />
            <Skeleton className="stat-skeleton-value" />
        </div>
    );
}
