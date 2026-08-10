import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SearchInput({ value, onChange, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const { t } = useTranslation();
    return (
        <div className="search-wrap">
            <span className="search-icon">
                <Search className="h-4 w-4" />
            </span>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? t("common.search")}
                   className="search-input" />
        </div>
    );
}
