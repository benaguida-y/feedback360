import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
    return (
        <p className="error-banner">
            <AlertCircle className="error-banner-icon" />
            {message}
        </p>
    );
}
