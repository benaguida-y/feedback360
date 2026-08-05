import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
    return (
        <p className="error-banner">
            <AlertCircle className="h-4 w-4 flex-none" />
            {message}
        </p>
    );
}
