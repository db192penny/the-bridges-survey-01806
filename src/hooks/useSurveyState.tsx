import { useState, useEffect } from "react";
import { SurveyResponse, CategoryResponse, VENDOR_CATEGORIES } from "@/utils/surveyData";

const STORAGE_KEY = "vendor_survey_responses";
const DRAFT_KEY = "vendor_survey_draft";

export interface SurveyDraft {
  name: string;
  phone: string;
  responses: Record<string, CategoryResponse>;
  additional_categories_requested: string[];
  additional_vendors: Record<string, string[]>;
}

export function useSurveyState() {
  const [draft, setDraft] = useState<SurveyDraft>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: "",
      phone: "",
      responses: {},
      additional_categories_requested: [],
      additional_vendors: {},
    };
  });

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const updateContactInfo = (name: string, phone: string) => {
    setDraft((prev) => ({ ...prev, name, phone }));
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

  const submitSurvey = () => {
    const responses: SurveyResponse[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    
    const newResponse: SurveyResponse = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      name: draft.name,
      phone: draft.phone,
      responses: draft.responses,
      additional_categories_requested: draft.additional_categories_requested,
      additional_vendors: draft.additional_vendors,
    };

    responses.push(newResponse);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    localStorage.removeItem(DRAFT_KEY);
  };

  const clearDraft = () => {
    setDraft({
      name: "",
      phone: "",
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
    const updateCount = () => {
      const responses: SurveyResponse[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
      setCount(responses.length);
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  return count;
}

export function getAllResponses(): SurveyResponse[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function clearAllResponses() {
  localStorage.removeItem(STORAGE_KEY);
}
