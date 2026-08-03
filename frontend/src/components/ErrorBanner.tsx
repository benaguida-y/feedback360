import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
    return (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/15 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 flex-none" />
            {message}
        </p>
    );
}
