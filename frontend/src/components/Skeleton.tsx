export default function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-cap-panel2 ${className}`} style={style} />;
}