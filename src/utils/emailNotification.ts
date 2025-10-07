import { supabase } from "@/integrations/supabase/client";

export async function sendSurveyNotification(responseData: any) {
  try {
    console.log('Sending survey notification via edge function...');
    
    const { data, error } = await supabase.functions.invoke('send-survey-notification', {
      body: { responseData },
    });

    if (error) {
      console.error('Failed to send email notification:', error);
      return;
    }

    console.log('Email notification sent successfully:', data);
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw - we still want the survey to save even if email fails
  }
}
