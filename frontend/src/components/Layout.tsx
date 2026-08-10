import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="layout-main-col">
                {/* Filigrane flower-logo en fond de chaque page */}
                <img src="/flower-logo.png" alt="" className="app-watermark" />
                <Header />
                <main className="app-main">{children}</main>
            </div>
        </div>
    );
}
