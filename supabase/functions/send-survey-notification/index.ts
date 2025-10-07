import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SurveyNotificationRequest {
  responseData: {
    timestamp: string;
    name: string;
    contact?: string;
    contactMethod?: string;
    responses: Record<string, any>;
    additional_categories_requested?: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responseData }: SurveyNotificationRequest = await req.json();

    console.log("Processing survey notification for:", responseData.name);

    // Count completed categories
    const completedCategories = Object.keys(responseData.responses || {}).filter(
      key => responseData.responses[key]?.vendors?.length > 0
    ).length;

    // Count total vendors
    const totalVendors = Object.values(responseData.responses || {}).reduce(
      (acc: number, curr: any) => acc + (curr?.vendors?.length || 0), 
      0
    );

    const emailBody = `
New Vendor Survey Response

Submitted: ${new Date(responseData.timestamp).toLocaleString()}
Name: ${responseData.name || 'Anonymous'}
Contact Method: ${responseData.contactMethod || 'Not provided'}
Contact: ${responseData.contact || 'Not provided'}

Summary:
- Completed ${completedCategories} categories
- Provided ${totalVendors} vendor recommendations
- Requested ${responseData.additional_categories_requested?.length || 0} additional categories

View full response in admin panel.
    `.trim();

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Vendor Survey <onboarding@resend.dev>",
        to: [
          "db@fivefourventures.com",
          "lindsay.envision@gmail.com"
        ],
        subject: `New Survey Response from ${responseData.name || 'Anonymous'}`,
        text: emailBody,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-survey-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
