import type { ReactNode } from "react";

export default function Card({ children, className = "", padded = false }: {
    children: ReactNode;
    className?: string;
    padded?: boolean;
}) {
    return (
        <div className={`card ${padded ? "card-padded" : "card-clip"} ${className}`}>
            {children}
        </div>
    );
}
