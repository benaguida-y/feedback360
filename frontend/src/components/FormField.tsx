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
        <label className="form-field">
            <span className="form-label form-field-label">{label}</span>
            <div className="form-field-control">
                <span className="form-icon">
                    <Icon className="icon-md" />
                </span>
                <input type={isPassword && reveal ? "text" : type}
                       value={value} onChange={(e) => onChange(e.target.value)}
                       required minLength={minLength} placeholder={placeholder}
                       className={`form-input ${isPassword ? "form-input-pw" : "form-input-txt"}`} />
                {isPassword && (
                    <button type="button" onClick={() => setReveal((v) => !v)}
                            aria-label={reveal ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            className="form-reveal">
                        {reveal ? <EyeOff className="icon-md" /> : <Eye className="icon-md" />}
                    </button>
                )}
            </div>
        </label>
    );
}
