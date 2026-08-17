import { useState } from "react";

// Gère le tri d'une liste : "champ,dir" (ex. "email,asc").
// Clic sur une colonne : asc -> desc -> plus de tri.
export function useSort() {
    const [sort, setSort] = useState("");

    function toggle(field: string) {
        setSort((cur) => {
            const [f, d] = cur.split(",");
            if (f !== field) return `${field},asc`;
            return d === "asc" ? `${field},desc` : "";
        });
    }

    return { sort, toggle };
}
