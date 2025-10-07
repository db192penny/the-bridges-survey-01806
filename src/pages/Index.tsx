import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Users, Search, Clock } from "lucide-react";
import { useResponseCount } from "@/hooks/useSurveyState";

const Index = () => {
  const navigate = useNavigate();
  const responseCount = useResponseCount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            Help Build Our Community
            <br />
            Vendor Directory! 🏡
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Share your trusted vendors in 2 minutes and we'll send the complete list to everyone
          </p>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Trusted Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Find vendors recommended by neighbors
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No More Searching</h3>
              <p className="text-sm text-muted-foreground">
                No more endless Facebook group searches
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Save Time & Money</h3>
              <p className="text-sm text-muted-foreground">
                Help your community save time and money
              </p>
            </Card>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={() => navigate("/survey")}
            className="h-16 px-12 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Start Survey
          </Button>

          {/* Social Proof */}
          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="font-medium">
              Join {responseCount > 0 ? responseCount : 47} neighbors who've already contributed!
            </span>
          </div>

          {/* Footer Note */}
          <p className="mt-8 text-sm text-muted-foreground">
            Takes 2 minutes • Mobile friendly • Your info stays private
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
