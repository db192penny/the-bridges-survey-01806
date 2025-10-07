import { useState } from "react";
import { VendorButton } from "./VendorButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VendorCategory } from "@/utils/surveyData";

interface CategoryQuestionProps {
  category: VendorCategory;
  onNext: (vendors: string[], skipReason: "dont_use" | "skip_for_now" | null) => void;
  initialVendors?: string[];
}

export function CategoryQuestion({ category, onNext, initialVendors = [] }: CategoryQuestionProps) {
  const [selectedVendors, setSelectedVendors] = useState<string[]>(initialVendors);
  const [showOther, setShowOther] = useState(
    initialVendors.some((v) => v.startsWith("Other:"))
  );
  const [otherValue, setOtherValue] = useState(
    initialVendors.find((v) => v.startsWith("Other:"))?.replace("Other: ", "") || ""
  );

  const toggleVendor = (vendor: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor]
    );
  };

  const handleNext = () => {
    const vendors = [...selectedVendors.filter((v) => !v.startsWith("Other:"))];
    if (showOther && otherValue.trim()) {
      vendors.push(`Other: ${otherValue.trim()}`);
    }
    console.log('CategoryQuestion submitting vendors:', {
      category: category.id,
      selectedVendors,
      showOther,
      otherValue,
      finalVendors: vendors
    });
    onNext(vendors, null);
  };

  const handleSkip = (reason: "dont_use" | "skip_for_now") => {
    onNext([], reason);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {category.title}
        </h2>
        <p className="text-lg text-muted-foreground">{category.description}</p>
      </div>

      <div className="space-y-3">
        {category.vendors.map((vendor) => (
          <VendorButton
            key={vendor}
            vendor={vendor}
            selected={selectedVendors.includes(vendor)}
            onClick={() => toggleVendor(vendor)}
          />
        ))}

        {showOther ? (
          <div className="space-y-2">
            <Input
              placeholder="Enter service provider name..."
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              className="h-14 text-base"
            />
            <button
              type="button"
              onClick={() => {
                setShowOther(false);
                setOtherValue("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowOther(true)}
            className="w-full min-h-[56px] px-6 py-3 rounded-xl border-2 border-dashed border-border text-left transition-all hover:border-primary hover:bg-secondary/30 text-muted-foreground hover:text-foreground"
          >
            Other (type name)
          </button>
        )}
      </div>

      <div className="pt-6 space-y-3">
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSkip("dont_use")}
            className="min-w-[180px]"
          >
            I don't use this service
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSkip("skip_for_now")}
            className="min-w-[140px]"
          >
            Skip for now
          </Button>
        </div>

        <Button
          size="lg"
          onClick={handleNext}
          className="w-full max-w-md mx-auto block h-14 text-lg"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
