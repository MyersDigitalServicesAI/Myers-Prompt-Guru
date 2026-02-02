import { type SVGProps } from "react";
import { Sparkles } from "lucide-react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" >
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">PromptMaster</span>
    </div>
  );
}
