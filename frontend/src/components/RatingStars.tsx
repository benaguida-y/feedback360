import { Star } from "lucide-react";

// Note moyenne (flottante) affichée en étoiles : 5 étoiles grises + une
// surcouche dorée rognée à (value / 5) %, ce qui rend le remplissage fractionnaire.
export default function RatingStars({ value }: { value: number | null }) {
    if (value == null) return <span className="rating-empty">—</span>;

    const clamped = Math.max(0, Math.min(5, value));
    const pct = (clamped / 5) * 100;
    // Note entière (ex. feedback 4/5) → "4" ; moyenne fractionnaire → "3.7".
    const label = Number.isInteger(clamped) ? String(clamped) : clamped.toFixed(1);

    return (
        <span className="rating" title={`${label} / 5`}>
            <span className="rating-stars">
                <span className="rating-stars-row rating-stars-bg">
                    {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="rating-star" />)}
                </span>
                <span className="rating-stars-row rating-stars-fill" style={{ width: `${pct}%` }}>
                    {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="rating-star rating-star-filled" />)}
                </span>
            </span>
            <span className="rating-value">{label}</span>
        </span>
    );
}
