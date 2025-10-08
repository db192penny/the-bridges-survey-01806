-- Create the survey_responses table
CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  timestamp TIMESTAMPTZ NOT NULL,
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  contact_method TEXT,
  responses JSONB DEFAULT '{}'::jsonb,
  additional_categories_requested TEXT[] DEFAULT ARRAY[]::TEXT[],
  additional_vendors JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert survey responses (public survey)
CREATE POLICY "Allow public inserts" 
ON public.survey_responses 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy: Allow anyone to read survey responses (for admin view)
CREATE POLICY "Allow public reads" 
ON public.survey_responses 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Create index for faster queries on created_at
CREATE INDEX idx_survey_responses_created_at ON public.survey_responses(created_at DESC);