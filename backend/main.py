import os
import google.generativeai as genai
from dotenv import load_dotenv
import subprocess
import sys
import requests

# Check if running in the Portia virtual environment, if not, switch to it
if not os.path.exists(os.path.join(os.path.dirname(sys.executable), 'activate')):
    print("Not running in Portia virtual environment. Attempting to relaunch script in the correct environment...")
    try:
        # Path to the virtual environment's Python interpreter
        portia_env_python = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                       "portia-env-py311", "bin", "python")
        
        # Re-execute the current script with the Portia environment's Python
        subprocess.run([portia_env_python, __file__])
        sys.exit(0)  # Exit the current instance of the script
    except Exception as e:
        print(f"Failed to execute in Portia environment: {e}")
        sys.exit(1)

try:
    from portia import (
        Portia,
        Config,
        StorageClass,
        LogLevel,
        LLMProvider,
    )
    from portia.tool_registry import InMemoryToolRegistry
    from pydantic import BaseModel, Field
    print("Portia package successfully imported!")
except ImportError as e:
    print(f"ImportError: {e}")
    raise ImportError("Portia package is not installed. Please install it to continue.")

# Load environment variables
load_dotenv()
print("Loading environment variables...")

# Get API keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PORTIA_API_KEY = os.getenv("PORTIA_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")
if not PORTIA_API_KEY:
    raise ValueError("PORTIA_API_KEY not found in environment variables.")
if not TAVILY_API_KEY:
    raise ValueError("TAVILY_API_KEY not found in environment variables.")

print("All required API keys found.")

# Configure Google Generative AI
genai.configure(api_key=GOOGLE_API_KEY)

# Define a custom Tavily search tool
class TavilySearchArgs(BaseModel):
    search_query: str = Field(
        description="The query to search for. For example, 'what is the capital of France?'"
    )

class TavilySearchTool:
    def __init__(self):
        self.id = "tavily_search"
        self.name = "Tavily Search"
        self.description = "Searches the internet using Tavily to find answers to the search query provided."
        self.args_schema = TavilySearchArgs
        self.output_schema = ("str", "str: output of the search results")
        self.should_summarize = True

    def run(self, args=None, **kwargs):
        """
        Run a search using Tavily's API.
        Accepts args object or kwargs that should contain 'search_query'
        """
        # Handle args parameter that Portia passes or fallback to kwargs
        if args and hasattr(args, 'search_query'):
            search_query = args.search_query
        else:
            search_query = kwargs.get("search_query", "")
            
        print(f"Executing Tavily search for: {search_query}")
        
        url = "https://api.tavily.com/search"
        headers = {
            "content-type": "application/json",
            "Authorization": f"Bearer {TAVILY_API_KEY}"
        }
        payload = {
            "query": search_query,
            "search_depth": "basic",
            "include_answer": True,
            "include_images": False,
            "include_raw_content": False,
            "max_results": 5
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            results = response.json()
            
            formatted_results = f"Search query: {search_query}\n\n"
            
            if "answer" in results:
                formatted_results += f"Answer: {results['answer']}\n\n"
            
            if "results" in results:
                formatted_results += "Search results:\n"
                for i, result in enumerate(results["results"], 1):
                    formatted_results += f"Result {i}:\n"
                    formatted_results += f"Title: {result.get('title', 'No title')}\n"
                    formatted_results += f"URL: {result.get('url', 'No URL')}\n"
                    formatted_results += f"Content: {result.get('content', 'No content')[:300]}...\n\n"
            
            return formatted_results
        
        except Exception as e:
            error_message = f"Tavily search failed: {str(e)}"
            print(f"Error: {error_message}")
            return error_message

# Initialize Portia
portia_instance = None
try:
    print("Configuring Portia...")
    portia_config = Config.from_default(
        storage_class=StorageClass.CLOUD,
        default_log_level=LogLevel.INFO,
        llm_provider=LLMProvider.GOOGLE_GENERATIVE_AI,
        llm_model_name="GEMINI_1_5_FLASH",
        api_key=PORTIA_API_KEY
    )
    
    # Create the Tavily search tool
    search_tool = TavilySearchTool()
    print(f"Created custom Tavily search tool: {search_tool.id}")
    
    # Create an in-memory tool registry and add the search tool
    tools = [search_tool]
    
    # Initialize Portia with the tools
    portia_instance = Portia(config=portia_config, tools=tools)
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
    print(f"Error setting up Portia with search tool: {e}")
    import traceback
    traceback.print_exc()
    portia_instance = None

def search_with_portia(query: str):
    """
    Search the web using Portia with the Tavily search tool
    """
    if not portia_instance:
        return "Error: Portia instance is not available."

    print(f"\n--- Running Portia with Query ---")
    print(f"Query: '{query}'")
    print("-" * 30)

    try:
        run_prompt = (
            f"{query}\n\n"
            f"Please use the Tavily Search tool to find relevant information online "
            f"before formulating your final answer."
        )

        plan_run = portia_instance.run(query=run_prompt)

        print("\n--- Portia Run Finished ---")
        print(f"Run State: {plan_run.state}")

        if plan_run.state == "COMPLETE":
            # Extract the final output from the nested structure
            if hasattr(plan_run, 'outputs') and hasattr(plan_run.outputs, 'final_output'):
                if hasattr(plan_run.outputs.final_output, 'value'):
                    return plan_run.outputs.final_output.value
                elif hasattr(plan_run.outputs.final_output, 'summary'):
                    return plan_run.outputs.final_output.summary
            
            # Fallback to step outputs if final output not available
            if hasattr(plan_run, 'outputs') and hasattr(plan_run.outputs, 'step_outputs'):
                if plan_run.outputs.step_outputs:
                    # Get the first step output's value
                    first_key = next(iter(plan_run.outputs.step_outputs))
                    step_output = plan_run.outputs.step_outputs[first_key]
                    if hasattr(step_output, 'value'):
                        return step_output.value
            return "No final output found"
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

# Run a test search
if __name__ == "__main__":
    if portia_instance:
        search_query = "who is uk prime minister?"
        final_answer = search_with_portia(search_query)
        print("\n" + "="*40)
        print("      FINAL ANSWER FROM PORTIA SEARCH      ")
        print("="*40)
        print(final_answer)
        print("="*40)
    else:
        print("\n--- Portia initialization failed ---")
        print("Please ensure you have:")
        print("1. Installed the Portia package correctly")
        print("2. Set up valid API keys in the .env file:")
        print("   - PORTIA_API_KEY for Portia")
        print("   - TAVILY_API_KEY for Tavily search")
        print("   - GOOGLE_API_KEY for Gemini LLM") 