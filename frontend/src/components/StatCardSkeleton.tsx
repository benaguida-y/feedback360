import Skeleton from "./Skeleton";

export default function StatCardSkeleton() {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-cap-border dark:bg-cap-panel">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-12" />
        </div>
    );
}