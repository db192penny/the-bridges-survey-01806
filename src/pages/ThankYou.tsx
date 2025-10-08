import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Copy } from "lucide-react";
import { useResponseCount, useSurveyState, getAllResponses } from "@/hooks/useSurveyState";
import { toast } from "sonner";

const ThankYou = () => {
  const navigate = useNavigate();
  const responseCount = useResponseCount();
  const { clearDraft } = useSurveyState();
  const [contactMethod, setContactMethod] = useState<"phone" | "email">("phone");
  
  // Get the most recent response to determine contact method
  useEffect(() => {
    const fetchContactMethod = async () => {
      const responses = await getAllResponses();
      const lastResponse = responses[responses.length - 1];
      setContactMethod(lastResponse?.contactMethod || "phone");
    };
    fetchContactMethod();
  }, []);

  const surveyUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleSubmitAnother = () => {
    clearDraft();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-primary animate-in zoom-in duration-500" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          You're Amazing! 🎉
        </h1>

        <p className="text-lg text-muted-foreground mb-6">
          Thanks for helping build our community's trusted vendor directory!
        </p>

        <div className="bg-secondary/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">What happens next?</h2>
          <div className="text-left space-y-3 text-muted-foreground">
            <p>✅ I'll compile a list of service providers everyone uses</p>
            <p>📝 I may reach out to you for reviews on service providers</p>
            <p>{contactMethod === "phone" ? "📱" : "📧"} {contactMethod === "phone" ? "Text you a link" : "Email you the complete list"} within 7 days</p>
            <p>🏡 Share it with the whole community</p>
            <p>💪 Together we're making life easier for all our neighbors!</p>
          </div>
        </div>

        <div className="bg-primary/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Know other neighbors who'd contribute?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The more neighbors who share, the better our service provider directory becomes!
          </p>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleCopyLink}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleSubmitAnother}
          className="mb-6 h-14 px-8"
        >
          Submit Another Response
        </Button>

        <p className="text-sm text-muted-foreground">
          You're one of <span className="font-semibold text-primary">{responseCount}</span> neighbors
          helping build this! 🏡
        </p>
      </Card>
    </div>
  );
};

export default ThankYou;
