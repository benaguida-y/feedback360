// Barre grise animée, réutilisable (cellules de tableau, cartes…).
export default function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`animate-pulse rounded bg-slate-200 ${className}`} style={style} />;
}