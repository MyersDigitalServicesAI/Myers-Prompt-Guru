import { FileText } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
             <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Coming Soon</h1>
            <p className="text-muted-foreground">This page will contain application settings and preferences.</p>
        </div>
    );
}
