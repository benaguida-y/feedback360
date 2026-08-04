import Skeleton from "./Skeleton";

// Placeholder d'une StatCard pendant le chargement.
export default function StatCardSkeleton() {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-12" />
        </div>
    );
}