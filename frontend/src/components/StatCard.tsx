export default function StatCard({ label, value, accent = "accent-default" }:
                                 { label: string; value: number | string; accent?: string }) {
    return (
        <div className="stat-card">
            <p className="stat-card-label">{label}</p>
            <p className={`stat-card-value ${accent}`}>{value}</p>
        </div>
    );
}
