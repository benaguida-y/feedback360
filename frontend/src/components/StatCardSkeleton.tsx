import Skeleton from "./Skeleton";

export default function StatCardSkeleton() {
    return (
        <div className="stat-card">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-12" />
        </div>
    );
}
