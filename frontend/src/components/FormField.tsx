import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

// Champ de formulaire : libellé, icône à gauche, et bascule afficher/masquer
// automatique lorsque le type est "password".
export default function FormField({ label, icon: Icon, type = "text", value, onChange, placeholder, minLength }: {
    label: string;
    icon: LucideIcon;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    minLength?: number;
}) {
    const [reveal, setReveal] = useState(false);
    const isPassword = type === "password";

    return (
        <label className="mb-5 block">
            <span className="form-label mb-1.5 block">{label}</span>
            <div className="relative">
                <span className="form-icon">
                    <Icon className="h-5 w-5" />
                </span>
                <input type={isPassword && reveal ? "text" : type}
                       value={value} onChange={(e) => onChange(e.target.value)}
                       required minLength={minLength} placeholder={placeholder}
                       className={`form-input ${isPassword ? "pr-11" : "pr-3.5"}`} />
                {isPassword && (
                    <button type="button" onClick={() => setReveal((v) => !v)}
                            aria-label={reveal ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            className="form-reveal">
                        {reveal ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
        </label>
    );
}
