import os
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional

from portia import (
    Portia,
    Config,
    StorageClass,
    LogLevel,
    LLMProvider,
    LLMModel,
)

load_dotenv()
print("Loading environment variables...")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PORTIA_API_KEY = os.getenv("PORTIA_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")
print("Google API key found.")

genai.configure(api_key=GOOGLE_API_KEY)

# --- Define Pydantic Model for Tool Arguments ---
class GoogleSearchArgs(BaseModel):
    query: str = Field(description="The search query to use.")

# --- Define Pydantic Model for Tool Output (Example - Adjust based on actual Google AI response) ---
class GoogleSearchResult(BaseModel):
    url: str = Field(description="URL of the search result.")
    title: str = Field(description="Title of the search result.")
    snippet: Optional[str] = Field(description="Brief content snippet from the result.")

class GoogleSearchResponse(BaseModel):
    results: Optional[List[GoogleSearchResult]] = Field(description="List of search results.")


from portia import ExecutionContext

class GoogleSearchTool:
    def __init__(self):
        self.id = "Google Search"
        self.name = "Google Search"
        self.description = "Searches the web using Google AI to find relevant information."
        self.args_schema = GoogleSearchArgs
        self.output_schema = ("GoogleSearchResponse", "GoogleSearchResponse")
        self.should_summarize = True

    def run(self, query: str) -> dict:  # Accept ExecutionContext and then query
        """
        Searches the web using Google AI for the given query.
        """
        print(f"--- TOOL EXECUTING: {self.id} --- Query: '{query}'")
        try:
            model = genai.GenerativeModel("gemini-2.0-flash")  # Or another suitable model
            response = model.generate_content(f"Search the web for: {query}. Please provide a list of at least 3 search results, including the URL for each result.")
            search_results_text = response.text
            print(f"--- RAW GOOGLE AI RESPONSE: ---\n{search_results_text}\n--- END OF RAW RESPONSE ---") 

            results = []
            for item in search_results_text.split("\n"):
                if item.startswith("URL: "):
                    url = item[len("URL: "):].strip()
                    results.append(GoogleSearchResult(url=url, title="Search Result", snippet="")) # Basic structure
            response_data = {"results": [result.model_dump() for result in results]} # Return as dictionary
            print(f"--- TOOL RESPONSE (Google AI): {response_data}")
            return response_data
        except Exception as e:
            error_message = f"Google AI search failed: {str(e)}"
            print(f"--- TOOL ERROR: {error_message}")
            return {"error": error_message}

# --- Configure Portia ---
portia_instance = None
try:
    print("Configuring Portia...")
    provider = LLMProvider.GOOGLE_GENERATIVE_AI
    model_enum_name = "GEMINI_1_5_FLASH" # Keep your preferred model
    print(f"Target Portia Config: Provider={provider}, Model Enum Name={model_enum_name}")

    portia_config = Config.from_default(
        storage_class=StorageClass.CLOUD,
        default_log_level=LogLevel.INFO,
        llm_provider=provider,
        llm_model_name=model_enum_name,
    )
    print("Portia configuration object created.")

    Search_tool_instance = GoogleSearchTool()
    tools_list = [Search_tool_instance]
    print(f"Initializing Portia with tools: {[tool.id for tool in tools_list]}")

    portia_instance = Portia(config=portia_config, tools=tools_list)
    print("-" * 30)
    print(f"Portia initialized successfully!")
    print(f"Using LLM Provider: {portia_instance.config.llm_provider}")
    try:
         resolved_default_model = portia_instance.config.model("default_model_name")
         print(f"Resolved Default Model: {resolved_default_model.name} ({resolved_default_model.api_name})")
    except Exception as e:
         print(f"Could not resolve default model details: {e}")
    print("-" * 30)

except Exception as e:
    print(f"\n--- ERROR during Portia Configuration/Initialization ---")
    import traceback
    traceback.print_exc()
    print(f"Error details: {e}")
    print("Portia could not be initialized. Cannot proceed with agentic search.")

# --- Main Function to Run Search with Portia ---
def search_with_portia_gemini_tavily(prompt: str): # Renamed function to reflect Google Search
    if not portia_instance:
        return "Error: Portia instance is not available."

    print(f"\n--- Running Portia with Prompt ---")
    print(f"Prompt: '{prompt}'")
    print("-" * 30)

    try:
        run_prompt = (
            f"{prompt}\n\n"
            f"Please use the 'Google Search' tool to find relevant information online "
            f"before formulating your final answer."
        )

        plan_run = portia_instance.run(query=run_prompt)

        print("\n--- Portia Run Finished ---")
        print(f"Run State: {plan_run.state}")

        if plan_run.state == "COMPLETE":
            final_output = plan_run.__str__
            if isinstance(final_output, dict):
                 return final_output.get('answer', final_output.get('summary', str(final_output)))
            else:
                 return str(final_output)

        elif plan_run.state == "CLARIFICATION":
             print(f"Run paused for clarification: {plan_run.clarifications}")
             return "Agent needs clarification to proceed."
        else:
             print(f"Run ended in state: {plan_run.state}")
             print(f"Step outputs: {getattr(plan_run, 'step_outputs', 'N/A')}")
             return f"Search process did not complete successfully. Final state: {plan_run.state}"

    except Exception as e:
        print(f"An unexpected error occurred during Portia run: {e}")
        import traceback
        traceback.print_exc()
        return f"Portia run failed with unexpected error: {e}"

# --- Example Usage ---
if __name__ == "__main__":
    if portia_instance:
        search_query = "Tell me about AI Encode Hackathon"
        final_answer = search_with_portia_gemini_tavily(search_query) # Keep the function name for now
        print("\n" + "="*40)
        print("      FINAL ANSWER FROM PORTIA/GEMINI ")
        print("="*40)
        print(final_answer)
        print("="*40)
    else:
        print("\nSkipping execution as Portia failed to initialize.")