import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorButtonProps {
  vendor: string;
  selected: boolean;
  onClick: () => void;
}

export function VendorButton({ vendor, selected, onClick }: VendorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full min-h-[56px] px-6 py-3 rounded-xl border-2 text-left transition-all",
        "flex items-center justify-between gap-3",
        "hover:border-primary hover:bg-secondary/50",
        "active:scale-[0.98]",
        selected
          ? "border-primary bg-secondary text-secondary-foreground font-medium"
          : "border-border bg-card"
      )}
    >
      <span className="text-base">{vendor}</span>
      {selected && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}
