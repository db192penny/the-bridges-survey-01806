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
  
  // State for additional vendor text inputs - must be at top level to avoid hooks violations
  const [vendorTexts, setVendorTexts] = useState<Record<string, string>>(() => {
    const texts: Record<string, string> = {};
    Object.entries(draft.additional_vendors).forEach(([key, vendors]) => {
      texts[key] = vendors.join("\n");
    });
    return texts;
  });
  
  // State for tracking which additional categories have vendor recommendations
  const [vendorCheckboxes, setVendorCheckboxes] = useState<Record<string, boolean>>(() => {
    const checkboxes: Record<string, boolean> = {};
    Object.entries(draft.additional_vendors).forEach(([key, vendors]) => {
      checkboxes[key] = vendors.length > 0;
    });
    return checkboxes;
  });

  // Fixed total steps: 1 (contact) + 7 (main categories) + 1 (additional selection) + 1 (vendor recommendations)
  const totalSteps = 10;

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

  // Steps 2-8: Category Questions (7 main categories)
  if (step >= 2 && step <= 8) {
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

  // Step 9: Additional Categories Selection
  if (step === 9) {
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

  // Step 10: Consolidated vendor recommendation page for all selected additional categories
  if (step === 10) {
    const handleSubmit = () => {
      // Save vendor recommendations for all selected categories
      selectedAdditional.forEach((category) => {
        const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        
        if (vendorCheckboxes[categoryKey]) {
          // Parse textarea content for checked categories
          const vendors = (vendorTexts[categoryKey] || "")
            .split(/[\n,]+/)
            .map((v) => v.trim())
            .filter(Boolean);
          updateAdditionalVendors(categoryKey, vendors);
        } else {
          // Save empty array for unchecked categories
          updateAdditionalVendors(categoryKey, []);
        }
      });
      
      submitSurvey();
      navigate("/thank-you");
    };
    
    const handleSkipAll = () => {
      // Save empty arrays for all categories
      selectedAdditional.forEach((category) => {
        const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        updateAdditionalVendors(categoryKey, []);
      });
      
      submitSurvey();
      navigate("/thank-you");
    };
    
    const handleCheckboxChange = (categoryKey: string, checked: boolean) => {
      setVendorCheckboxes(prev => ({ ...prev, [categoryKey]: checked }));
    };
    
    const handleTextChange = (categoryKey: string, text: string) => {
      setVendorTexts(prev => ({ ...prev, [categoryKey]: text }));
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
              Do you know any great vendors for these services? 🌟
            </h2>
            <p className="text-lg text-muted-foreground">
              Check the box for any service where you can recommend vendors
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-6">
            {selectedAdditional.map((category) => {
              const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
              const isChecked = vendorCheckboxes[categoryKey] || false;
              const textValue = vendorTexts[categoryKey] || "";
              
              return (
                <div key={category} className="p-6 rounded-lg border border-border bg-card">
                  <div className="flex items-center space-x-3 mb-4">
                    <Checkbox
                      id={`vendor-${categoryKey}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCheckboxChange(categoryKey, !!checked)}
                    />
                    <Label 
                      htmlFor={`vendor-${categoryKey}`} 
                      className="text-lg font-medium cursor-pointer flex-1"
                    >
                      {category}
                    </Label>
                  </div>
                  
                  <Textarea
                    placeholder="Enter vendor names - one per line or separated by commas"
                    value={textValue}
                    onChange={(e) => handleTextChange(categoryKey, e.target.value)}
                    disabled={!isChecked}
                    className="min-h-[100px] text-base"
                  />
                </div>
              );
            })}

            <div className="pt-6 space-y-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleSkipAll}
                className="w-full"
              >
                I don't know any vendors for these
              </Button>

              <Button
                size="lg"
                onClick={handleSubmit}
                className="w-full h-14 text-lg"
              >
                Submit Survey
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
