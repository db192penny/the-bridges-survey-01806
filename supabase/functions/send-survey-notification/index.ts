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
    additional_vendors?: Record<string, string[]>;
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
    const mainVendors = Object.values(responseData.responses || {}).reduce(
      (acc: number, curr: any) => acc + (curr?.vendors?.length || 0), 0
    );
    const additionalVendors = Object.values(responseData.additional_vendors || {}).reduce(
      (acc: number, vendors: any) => acc + (Array.isArray(vendors) ? vendors.filter(Boolean).length : 0), 0
    );
    const totalVendors = mainVendors + additionalVendors;

    // Category mapping for display names
    const categoryNames: Record<string, string> = {
      pool_service: "Pool Service",
      hvac: "HVAC / Air Conditioning",
      landscaping: "Landscaping / Lawn Care",
      pest_control: "Pest Control",
      electrician: "Electrician",
      plumber: "Plumber",
      handyman: "Handyman"
    };

    // Build vendor list by category
    let vendorList = "\n\nSelected Service Providers:\n";
    vendorList += "=" + "=".repeat(50) + "\n\n";

    // Main categories
    Object.entries(responseData.responses || {}).forEach(([catId, catData]: [string, any]) => {
      if (catData?.vendors?.length > 0) {
        const categoryName = categoryNames[catId] || catId;
        vendorList += `${categoryName}:\n`;
        catData.vendors.forEach((vendor: string) => {
          vendorList += `  • ${vendor}\n`;
        });
        vendorList += "\n";
      }
    });

    // Additional categories
    if (responseData.additional_vendors && Object.keys(responseData.additional_vendors).length > 0) {
      const additionalCats = responseData.additional_categories_requested || [];
      additionalCats.forEach((categoryName: string) => {
        const categoryKey = categoryName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        const vendors = responseData.additional_vendors?.[categoryKey] || [];
        if (vendors.filter(Boolean).length > 0) {
          vendorList += `${categoryName}:\n`;
          vendors.filter(Boolean).forEach((vendor: string) => {
            vendorList += `  • ${vendor}\n`;
          });
          vendorList += "\n";
        }
      });
    }

    const siteUrl = Deno.env.get("SUPABASE_URL")?.replace(/\.supabase\.co$/, ".lovable.app") || "your-site";
    const adminUrl = `${siteUrl}/admin`;

    const emailBody = `
New Service Provider Survey Response

Submitted: ${new Date(responseData.timestamp).toLocaleString()}
Name: ${responseData.name || 'Anonymous'}
Contact Method: ${responseData.contactMethod || 'Not provided'}
Contact: ${responseData.contact || 'Not provided'}

Summary:
- Completed ${completedCategories} categories
- Provided ${totalVendors} service provider recommendations
- Requested ${responseData.additional_categories_requested?.length || 0} additional categories
${vendorList}
View full response in admin panel:
${adminUrl}
    `.trim();

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Service Provider Survey <onboarding@resend.dev>",
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
