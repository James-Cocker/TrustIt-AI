import google.generativeai as genai
import traceback

class QuestionGeneratorAgent:
    """Agent that uses Gemini to generate sub-questions from an initial query."""
    
    def __init__(self, config):
        self.config = config
        self._configure_gemini()
        
    def _configure_gemini(self):
        """Configure the Google Generative AI client."""
        try:
            genai.configure(api_key=self.config["google_api_key"])
            print("Gemini configured successfully for Question Generator.")
        except Exception as e:
            print(f"Error configuring Gemini: {e}")
            # Depending on the use case, you might want to raise an exception or handle this differently

    def generate_questions(self, initial_query: str, num_questions: int = 3) -> list[str]:
        """Generate a list of specific questions based on the initial query."""
        print(f"\n--- Generating Sub-Questions for: '{initial_query}' ---")
        try:
            model = genai.GenerativeModel('gemini-1.5-flash') 
            prompt = (
                f"Based on the user query: '{initial_query}', generate {num_questions} specific, concise questions "
                f"that would help gather comprehensive information about the topic through web searches. "
                f"Focus on distinct aspects or facets of the original query. "
                f"Return *only* the questions, each on a new line, without any numbering or bullet points."
            )
            
            response = model.generate_content(prompt)
            
            if response.text:
                questions = [q.strip() for q in response.text.split('\n') if q.strip()]
                print(f"Generated {len(questions)} questions:")
                for i, q in enumerate(questions):
                    print(f"  {i+1}. {q}")
                print("-" * 30)
                return questions
            else:
                print("Gemini did not return any questions.")
                return [initial_query] # Fallback to the original query

        except Exception as e:
            print(f"Error generating questions with Gemini: {e}")
            traceback.print_exc()
            # Fallback to the original query if generation fails
            return [initial_query] 