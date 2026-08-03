import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SearchInput({ value, onChange, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="relative w-72">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Search className="h-4 w-4" />
            </span>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? t("common.search")}
                   className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-cap-border dark:bg-cap-panel dark:text-slate-100 dark:placeholder:text-slate-500" />
        </div>
    );
}