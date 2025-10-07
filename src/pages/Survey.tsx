import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { CategoryQuestion } from "@/components/survey/CategoryQuestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSurveyState } from "@/hooks/useSurveyState";
import { VENDOR_CATEGORIES, ADDITIONAL_CATEGORIES, CategoryResponse } from "@/utils/surveyData";
import { ArrowLeft } from "lucide-react";

const Survey = () => {
  const navigate = useNavigate();
  const {
    draft,
    updateContactInfo,
    updateCategoryResponse,
    updateAdditionalCategories,
    updateAdditionalVendors,
    submitSurvey,
  } = useSurveyState();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(draft.name || "");
  const [phone, setPhone] = useState(draft.phone || "");
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>(
    draft.additional_categories_requested || []
  );
  const [otherCategory, setOtherCategory] = useState("");

  // Calculate total steps dynamically
  const totalSteps = 10 + selectedAdditional.length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleNext = () => {
    if (step === totalSteps) {
      submitSurvey();
      navigate("/thank-you");
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCategoryComplete = (
    categoryId: string,
    vendors: string[],
    skipReason: "dont_use" | "skip_for_now" | null
  ) => {
    const response: CategoryResponse = {
      vendors,
      skipped: skipReason !== null,
      skip_reason: skipReason,
    };
    updateCategoryResponse(categoryId, response);
    handleNext();
  };

  // Step 1: Contact Info
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <ProgressBar current={step} total={totalSteps} />

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Let's Get Started!
            </h2>
            <p className="text-lg text-muted-foreground">
              We'll send you the complete vendor list when it's ready!
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-base mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone">Your Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 text-base mt-2"
              />
            </div>

            <Button
              size="lg"
              onClick={() => {
                if (name?.trim() && phone?.trim()) {
                  updateContactInfo(name, phone);
                  handleNext();
                }
              }}
              disabled={!name?.trim() || !phone?.trim()}
              className="w-full h-14 text-lg mt-6"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Steps 2-9: Category Questions
  if (step >= 2 && step <= 9) {
    const categoryIndex = step - 2;
    const category = VENDOR_CATEGORIES[categoryIndex];
    const existingResponse = draft.responses[category.id];

    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <ProgressBar current={step} total={totalSteps} />

          <CategoryQuestion
            category={category}
            initialVendors={existingResponse?.vendors || []}
            onNext={(vendors, skipReason) =>
              handleCategoryComplete(category.id, vendors, skipReason)
            }
          />
        </div>
      </div>
    );
  }

  // Step 10: Additional Categories Selection
  if (step === 10) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <ProgressBar current={step} total={totalSteps} />

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              What Other Services Would Help? 💡
            </h2>
            <p className="text-lg text-muted-foreground">
              We want to build the most useful directory possible!
            </p>
          </div>

          <div className="space-y-4 max-w-xl mx-auto">
            {ADDITIONAL_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors">
                <Checkbox
                  id={category}
                  checked={selectedAdditional.includes(category)}
                  onCheckedChange={(checked) => {
                    setSelectedAdditional((prev) =>
                      checked
                        ? [...prev, category]
                        : prev.filter((c) => c !== category)
                    );
                  }}
                />
                <Label htmlFor={category} className="text-base cursor-pointer flex-1">
                  {category}
                </Label>
              </div>
            ))}

            <div className="pt-2">
              <Label htmlFor="other-category">Other category:</Label>
              <Input
                id="other-category"
                placeholder="e.g., Dog Walking, Tutoring..."
                value={otherCategory}
                onChange={(e) => setOtherCategory(e.target.value)}
                className="h-12 text-base mt-2"
              />
            </div>

            <div className="pt-6 space-y-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  updateAdditionalCategories([]);
                  handleNext();
                }}
                className="w-full"
              >
                Skip This Question
              </Button>

              <Button
                size="lg"
                onClick={() => {
                  const categories = [...selectedAdditional];
                  if (otherCategory.trim()) {
                    categories.push(otherCategory.trim());
                  }
                  updateAdditionalCategories(categories);
                  handleNext();
                }}
                className="w-full h-14 text-lg"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Steps 11+: Collect vendor names for selected additional categories
  if (step > 10) {
    const additionalIndex = step - 11;
    const currentCategory = selectedAdditional[additionalIndex];
    const categoryKey = currentCategory.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const existingVendors = draft.additional_vendors[categoryKey] || [];
    const [vendorText, setVendorText] = useState(existingVendors.join("\n"));

    const handleAdditionalNext = () => {
      const vendors = vendorText
        .split(/[\n,]+/)
        .map((v) => v.trim())
        .filter(Boolean);
      updateAdditionalVendors(categoryKey, vendors);
      handleNext();
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background py-8 px-4">
        <div className="container max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <ProgressBar current={step} total={totalSteps} />

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {currentCategory}
            </h2>
            <p className="text-lg text-muted-foreground">
              Know any great {currentCategory.toLowerCase()} vendors in our community?
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-4">
            <Textarea
              placeholder="Enter vendor names - one per line or separated by commas&#10;&#10;Example:&#10;ABC Roofing&#10;Quality Roofing Company&#10;Top Tier Roofs"
              value={vendorText}
              onChange={(e) => setVendorText(e.target.value)}
              className="min-h-[200px] text-base"
            />

            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  updateAdditionalVendors(categoryKey, []);
                  handleNext();
                }}
                className="w-full"
              >
                I don't know any
              </Button>

              <Button
                size="lg"
                onClick={handleAdditionalNext}
                className="w-full h-14 text-lg"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Survey;
