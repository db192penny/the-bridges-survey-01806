import { useState, useEffect } from "react";
import { SurveyResponse, CategoryResponse, VENDOR_CATEGORIES } from "@/utils/surveyData";
import { sendSurveyNotification } from "@/utils/emailNotification";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "vendor_survey_responses";
const DRAFT_KEY = "vendor_survey_draft";

export interface SurveyDraft {
  name: string;
  contact: string;
  contactMethod: "email" | "phone";
  responses: Record<string, CategoryResponse>;
  additional_categories_requested: string[];
  additional_vendors: Record<string, string[]>;
}

export function useSurveyState() {
  const [draft, setDraft] = useState<SurveyDraft>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        name: parsed.name || "",
        contact: parsed.contact || parsed.phone || "",
        contactMethod: parsed.contactMethod || "phone",
        responses: parsed.responses || {},
        additional_categories_requested: parsed.additional_categories_requested || [],
        additional_vendors: parsed.additional_vendors || {},
      };
    }
    return {
      name: "",
      contact: "",
      contactMethod: "phone",
      responses: {},
      additional_categories_requested: [],
      additional_vendors: {},
    };
  });

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const updateContactInfo = (name: string, contact: string, contactMethod: "email" | "phone") => {
    setDraft((prev) => ({ ...prev, name, contact, contactMethod }));
  };

  const updateCategoryResponse = (categoryId: string, response: CategoryResponse) => {
    setDraft((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [categoryId]: response,
      },
    }));
  };

  const updateAdditionalCategories = (categories: string[]) => {
    setDraft((prev) => ({ ...prev, additional_categories_requested: categories }));
  };

  const updateAdditionalVendors = (categoryKey: string, vendors: string[]) => {
    setDraft((prev) => ({
      ...prev,
      additional_vendors: {
        ...prev.additional_vendors,
        [categoryKey]: vendors,
      },
    }));
  };

  const submitSurvey = async () => {
    const newResponse: SurveyResponse = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      name: draft.name,
      phone: draft.contact,
      contact: draft.contact,
      contactMethod: draft.contactMethod,
      responses: draft.responses,
      additional_categories_requested: draft.additional_categories_requested,
      additional_vendors: draft.additional_vendors,
    };

    // Save to Supabase database
    console.log('Submitting survey to database:', newResponse);
    const { error } = await supabase
      .from('survey_responses')
      .insert({
        timestamp: newResponse.timestamp,
        name: newResponse.name,
        contact: newResponse.contact,
        phone: newResponse.phone,
        contact_method: newResponse.contactMethod,
        responses: newResponse.responses as any,
        additional_categories_requested: newResponse.additional_categories_requested,
        additional_vendors: newResponse.additional_vendors as any,
      });

    if (error) {
      console.error('Error saving survey response to database:', error);
      // Fallback to localStorage on error
      const responses: SurveyResponse[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      responses.push(newResponse);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    } else {
      console.log('Survey saved successfully to database!');
    }

    localStorage.removeItem(DRAFT_KEY);
    
    // Send email notification (non-blocking)
    sendSurveyNotification(newResponse).catch(console.error);
  };

  const clearDraft = () => {
    setDraft({
      name: "",
      contact: "",
      contactMethod: "phone",
      responses: {},
      additional_categories_requested: [],
      additional_vendors: {},
    });
    localStorage.removeItem(DRAFT_KEY);
  };

  return {
    draft,
    updateContactInfo,
    updateCategoryResponse,
    updateAdditionalCategories,
    updateAdditionalVendors,
    submitSurvey,
    clearDraft,
  };
}

export function useResponseCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count: dbCount, error } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true });
      
      if (!error && dbCount !== null) {
        setCount(dbCount);
      }
    };

    fetchCount();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('survey_responses_count')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'survey_responses' 
      }, () => {
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching responses:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    name: row.name,
    phone: row.phone || row.contact || '',
    contact: row.contact || '',
    contactMethod: (row.contact_method as "email" | "phone") || "phone",
    responses: (row.responses as any) || {},
    additional_categories_requested: row.additional_categories_requested || [],
    additional_vendors: (row.additional_vendors as any) || {},
  }));
}

export async function clearAllResponses() {
  await supabase.from('survey_responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}
