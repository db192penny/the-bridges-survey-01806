import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Share2, Copy } from "lucide-react";
import { useResponseCount, useSurveyState } from "@/hooks/useSurveyState";
import { toast } from "sonner";

const ThankYou = () => {
  const navigate = useNavigate();
  const responseCount = useResponseCount();
  const { clearDraft } = useSurveyState();

  const surveyUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(surveyUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleSubmitAnother = () => {
    clearDraft();
    navigate("/survey");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center px-4 py-12">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-primary animate-in zoom-in duration-500" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Thanks for Contributing! 🎉
        </h1>

        <p className="text-lg text-muted-foreground mb-8">
          We'll compile everyone's recommendations and email the complete vendor directory to you
          within 7 days.
        </p>

        <div className="bg-secondary/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Know other neighbors who'd contribute?</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleCopyLink}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleShareFacebook}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share on Facebook
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
