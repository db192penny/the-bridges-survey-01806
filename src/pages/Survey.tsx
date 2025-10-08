import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/survey/ProgressBar";
import { CategoryQuestion } from "@/components/survey/CategoryQuestion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSurveyState } from "@/hooks/useSurveyState";
import { VENDOR_CATEGORIES, ADDITIONAL_CATEGORIES, CategoryResponse } from "@/utils/surveyData";
import { ArrowLeft } from "lucide-react";
import { 
  startSurveySession, 
  updateSessionProgress, 
  completeSurveySession, 
  abandonSurveySession,
  getCurrentSession 
} from "@/utils/surveyAnalytics";

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
  const [contact, setContact] = useState(draft.contact || "");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">(draft.contactMethod || "phone");
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>(
    draft.additional_categories_requested || []
  );
  const [otherCategory, setOtherCategory] = useState("");
  
  // State for additional vendor text inputs - must be at top level to avoid hooks violations
  const [vendorTexts, setVendorTexts] = useState<Record<string, string>>(() => {
    const texts: Record<string, string> = {};
    Object.entries(draft.additional_vendors).forEach(([key, vendors]) => {
      texts[key] = vendors.length > 0 ? vendors[0] : "";
    });
    return texts;
  });

  // Fixed total steps: 1 (contact) + 7 (main categories) + 1 (additional selection) + 1 (vendor recommendations)
  const totalSteps = 10;

  // Initialize tracking session
  useEffect(() => {
    const currentSession = getCurrentSession();
    if (!currentSession) {
      startSurveySession();
    }
  }, []);

  // Track progress on step changes
  useEffect(() => {
    const categoryId = step >= 2 && step <= 8 
      ? VENDOR_CATEGORIES[step - 2]?.id 
      : undefined;
    updateSessionProgress(step, categoryId);
  }, [step]);

  // Track abandonment on unmount
  useEffect(() => {
    return () => {
      abandonSurveySession();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleNext = () => {
    if (step === totalSteps) {
      completeSurveySession();
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
              Thanks for Helping Out The Bridges! 🏡
            </h2>
            <p className="text-lg text-muted-foreground">
              We'll send you the complete service provider list when it's ready!
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
                autoComplete="name"
                className="h-14 text-base mt-2"
              />
            </div>

            <div>
              <Label className="mb-3 block">Where should we send your service provider list?</Label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={contactMethod === "phone"}
                    onChange={(e) => setContactMethod(e.target.value as "phone")}
                    className="w-4 h-4"
                  />
                  <span>Phone Number</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={contactMethod === "email"}
                    onChange={(e) => setContactMethod(e.target.value as "email")}
                    className="w-4 h-4"
                  />
                  <span>Email</span>
                </label>
              </div>
              
              <Input
                id="contact"
                type={contactMethod === "email" ? "email" : "tel"}
                placeholder={contactMethod === "email" ? "john@example.com" : "(555) 123-4567"}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                autoComplete={contactMethod === "email" ? "email" : "tel"}
                className="h-14 text-base"
              />
            </div>

            <Button
              size="lg"
              onClick={() => {
                if (name?.trim() && contact?.trim()) {
                  updateContactInfo(name, contact, contactMethod);
                  handleNext();
                }
              }}
              disabled={!name?.trim() || !contact?.trim()}
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
            key={category.id}
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
    const handleSubmit = async () => {
      // Save vendor recommendations for all selected categories
      selectedAdditional.forEach((category) => {
        const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        const vendorName = (vendorTexts[categoryKey] || "").trim();
        
        console.log('Saving additional vendor:', {
          category,
          categoryKey,
          vendorName,
          vendorTexts
        });
        
        updateAdditionalVendors(categoryKey, vendorName ? [vendorName] : []);
      });
      
      completeSurveySession();
      await submitSurvey();
      navigate("/thank-you");
    };
    
    const handleSkipAll = async () => {
      // Save empty arrays for all categories
      selectedAdditional.forEach((category) => {
        const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        updateAdditionalVendors(categoryKey, []);
      });
      
      completeSurveySession();
      await submitSurvey();
      navigate("/thank-you");
    };
    
    const handleTextChange = (categoryKey: string, text: string) => {
      setVendorTexts(prev => ({ ...prev, [categoryKey]: text }));
      // Save to draft immediately as user types
      updateAdditionalVendors(categoryKey, text.trim() ? [text.trim()] : []);
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
              Do you know any great service providers for these services? 🌟
            </h2>
            <p className="text-lg text-muted-foreground">
              Enter a service provider name for any service you can recommend (optional)
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {selectedAdditional.map((category) => {
              const categoryKey = category.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
              const textValue = vendorTexts[categoryKey] || "";
              
              return (
                <div key={category} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-border bg-card">
                  <Label 
                    htmlFor={`vendor-${categoryKey}`} 
                    className="text-base font-medium sm:w-1/3 flex-shrink-0"
                  >
                    {category}
                  </Label>
                  <Input
                    id={`vendor-${categoryKey}`}
                    placeholder="Service provider name"
                    value={textValue}
                    onChange={(e) => handleTextChange(categoryKey, e.target.value)}
                    className="h-12 text-base flex-1"
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
                I don't know any service providers for these
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
