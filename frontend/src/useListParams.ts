import { useSearchParams } from "react-router-dom";

// Synchronise l'état d'une liste (page, taille, recherche, tri, filtres) avec l'URL,
// pour que retour / rafraîchissement / partage conservent la vue exacte.
export function useListParams() {
    const [params, setParams] = useSearchParams();

    // Écrit une valeur dans l'URL ; toute modif AUTRE que la page revient page 1.
    function set(key: string, value: string) {
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value); else next.delete(key);
            if (key !== "page") next.delete("page");
            return next;
        }, { replace: true });
    }

    const get = (key: string) => params.get(key) ?? "";

    // Page 1-based dans l'URL (comme l'API) ; 0-based en interne pour <Pagination>.
    const page = Math.max(0, Number(params.get("page") ?? "1") - 1);
    const setPage = (p: number) => set("page", String(p + 1));

    const size = Number(params.get("size") ?? "10");
    const setSize = (s: number) => set("size", String(s));

    const search = get("search");
    const setSearch = (v: string) => set("search", v);

    // Tri "champ,dir" : clic asc -> desc -> plus de tri.
    const sort = get("sort");
    function toggle(field: string) {
        const [f, d] = sort.split(",");
        const next = f !== field ? `${field},asc` : d === "asc" ? `${field},desc` : "";
        set("sort", next);
    }

    return { page, setPage, size, setSize, search, setSearch, sort, toggle, get, set };
}
