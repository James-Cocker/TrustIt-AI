import google.generativeai as genai
import traceback
from typing import List, Dict, Any

class FactQuestioningAgent:
    """Agent that uses Gemini to generate fact-verification questions and analyze evidence."""
    
    def __init__(self, config):
        self.config = config
        self._configure_gemini()
        
    def _configure_gemini(self):
        """Configure the Google Generative AI client."""
        try:
            genai.configure(api_key=self.config["google_api_key"])
            print("Gemini configured successfully for Fact Questioning Agent.")
        except Exception as e:
            print(f"Error configuring Gemini: {e}")
            raise

    def generate_verification_questions(self, claim: str, num_questions: int = 3) -> List[str]:
        """Generate a list of fact-verification questions based on the claim."""
        print(f"\n--- Generating Fact-Verification Questions for: '{claim}' ---")
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')  # Using pro model for better reasoning
            prompt = (
                f"Given the following claim: '{claim}'\n\n"
                f"Generate {num_questions} specific, fact-checking questions that would help verify the truthfulness of this claim. "
                f"Focus on:\n"
                f"1. Verifiable facts and data points\n"
                f"2. Source credibility and authority\n"
                f"3. Context and timing of the claim\n"
                f"4. Potential biases or conflicts of interest\n"
                f"Return *only* the questions, each on a new line, without any numbering or bullet points."
            )
            
            response = model.generate_content(prompt)
            
            if response.text:
                questions = [q.strip() for q in response.text.split('\n') if q.strip()]
                print(f"Generated {len(questions)} verification questions:")
                for i, q in enumerate(questions):
                    print(f"  {i+1}. {q}")
                print("-" * 30)
                return questions
            else:
                print("Gemini did not return any questions.")
                return [claim]  # Fallback to the original claim

        except Exception as e:
            print(f"Error generating verification questions with Gemini: {e}")
            traceback.print_exc()
            return [claim]

    def analyze_evidence(self, claim: str, evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze the collected evidence and provide a fact-checking assessment."""
        print(f"\n--- Analyzing Evidence for Claim: '{claim}' ---")
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            # Format evidence for analysis
            evidence_text = "\n".join([
                f"Source: {e.get('source', 'Unknown')}\n"
                f"Content: {e.get('content', 'No content')}\n"
                f"Relevance: {e.get('relevance', 'Unknown')}\n"
                for e in evidence
            ])
            
            prompt = (
                f"Given the following claim: '{claim}'\n\n"
                f"And the following evidence:\n{evidence_text}\n\n"
                f"Please analyze the evidence and provide:\n"
                f"1. A confidence score (0-100) on the claim's veracity\n"
                f"2. Key findings that support or contradict the claim\n"
                f"3. Any gaps in the evidence\n"
                f"4. Recommendations for further verification\n"
                f"Format the response as a structured analysis."
            )
            
            response = model.generate_content(prompt)
            
            if response.text:
                return {
                    "claim": claim,
                    "analysis": response.text,
                    "evidence_count": len(evidence)
                }
            else:
                return {
                    "claim": claim,
                    "analysis": "Failed to analyze evidence",
                    "evidence_count": len(evidence)
                }

        except Exception as e:
            print(f"Error analyzing evidence with Gemini: {e}")
            traceback.print_exc()
            return {
                "claim": claim,
                "analysis": f"Error during analysis: {str(e)}",
                "evidence_count": len(evidence)
            } 