// Panneau de marque (gauche) partagé par les écrans Login et Activate.
export default function BrandPanel() {
    return (
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-light p-14 text-white lg:flex">
            {/* halos flous ronds */}
            <div className="blob pointer-events-none absolute -right-32 -top-32 h-96 w-96 bg-brand-light/40 blur-3xl" />
            <div className="blob pointer-events-none absolute top-1/3 -left-24 h-80 w-80 bg-white/10 blur-3xl" />
            <div className="blob pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 bg-white/10 blur-3xl" />

            {/* anneaux décoratifs */}
            <div className="blob pointer-events-none absolute -bottom-40 -left-40 h-[32rem] w-[32rem] border border-white/15" />
            <div className="blob pointer-events-none absolute -bottom-28 -left-28 h-96 w-96 border border-white/10" />

            {/* flower-logo en grand filigrane */}
            <img src="/flower-logo.png" alt=""
                 className="pointer-events-none absolute -bottom-16 -right-16 w-96 opacity-10 brightness-0 invert" />

            {/* grille en filigrane */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
                 style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

            <div className="flex items-center justify-between">
                <img src="/logo.png" alt="Feedback360" className="relative w-70 brightness-0 invert" />
                <span className="mb-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
                    <span className="blob h-1.5 w-1.5 bg-emerald-400" />
                    Plateforme interne · Capgemini
                </span>
            </div>

            <div className="relative">
                <h1 className="text-5xl font-bold leading-tight tracking-tight">Feedback360</h1>
                <h1 className="mt-6 text-5xl leading-[1.05] tracking-tight">
                    Vos retours,<br />
                    <span className="text-white/70">notre progrès.</span>
                </h1>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
                    Collectez et analysez les feedbacks de formation, simplement et en un seul endroit.
                </p>
            </div>

            <p className="relative text-sm text-white/60">© 2026 Feedback360</p>
        </div>
    );
}