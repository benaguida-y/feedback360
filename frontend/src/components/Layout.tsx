import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar />
            <div className="relative flex flex-1 flex-col overflow-hidden">
                {/* Filigrane flower-logo en fond de chaque page */}
                <img src="/flower-logo.png" alt=""
                     className="pointer-events-none absolute -bottom-10 -right-10 w-200 select-none opacity-[0.5]" />
                <Header />
                <main className="relative flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
}