-- Add DELETE policy to allow deleting survey responses
CREATE POLICY "Allow public deletes" 
ON survey_responses 
FOR DELETE 
USING (true);