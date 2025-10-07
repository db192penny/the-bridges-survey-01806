export async function sendSurveyNotification(responseData: any) {
  const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.error('Resend API key not found');
    return;
  }

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
Email: ${responseData.email || 'Not provided'}

Summary:
- Completed ${completedCategories} categories
- Provided ${totalVendors} vendor recommendations
- Requested ${responseData.additional_categories_requested?.length || 0} additional categories

View full response in admin panel:
${window.location.origin}/admin
Password: courtney2025
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vendor Survey <onboarding@resend.dev>',
        to: [
          'db@fivefourventures.com',
          'lindsay.envision@gmail.com'
        ],
        subject: `New Survey Response from ${responseData.name || 'Anonymous'}`,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', errorText);
    } else {
      console.log('Email notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw - we still want the survey to save even if email fails
  }
}
