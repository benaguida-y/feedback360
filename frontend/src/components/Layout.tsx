import { type ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

// Position de scroll mémorisée par entrée d'historique (survit à la navigation entre
// pages, car chaque page monte son propre Layout) → restaurée au retour.
const scrollPositions = new Map<string, number>();

export default function Layout({ children }: { children: ReactNode }) {
    const mainRef = useRef<HTMLElement>(null);
    const { key } = useLocation();

    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;

        const onScroll = () => scrollPositions.set(key, el.scrollTop);
        el.addEventListener("scroll", onScroll, { passive: true });

        const saved = scrollPositions.get(key) ?? 0;
        el.scrollTop = saved;

        // Le contenu peut grandir après coup (données chargées en async) : on ré-applique
        // la position sur quelques frames, le temps que la page atteigne sa hauteur finale.
        let raf = 0;
        if (saved > 0) {
            const start = performance.now();
            const tick = () => {
                if (el.scrollTop < saved && el.scrollHeight - el.clientHeight >= saved) {
                    el.scrollTop = saved;
                }
                if (el.scrollTop < saved && performance.now() - start < 1500) {
                    raf = requestAnimationFrame(tick);
                }
            };
            raf = requestAnimationFrame(tick);
        }

        return () => {
            el.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [key]);

    return (
        <div className="app-shell">
            <Sidebar />
            <div className="layout-main-col">
                {/* Filigrane flower-logo en fond de chaque page */}
                <img src="/flower-logo.png" alt="" className="app-watermark" />
                <Header />
                <main ref={mainRef} className="app-main">{children}</main>
            </div>
        </div>
    );
}
