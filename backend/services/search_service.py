import traceback
import google.generativeai as genai

from portia import Portia, Config, StorageClass, LogLevel, LLMProvider
from backend.tools import TavilySearchTool

class PortiaSearchService:
    """Service to handle Portia initialization and search functionality"""
    
    def __init__(self, config):
        self.config = config
        self.portia_instance = None
        self._initialize_portia()
    
    def _initialize_portia(self):
        """Initialize Portia with the search tool"""
        try:
            # Configure Google Generative AI
            genai.configure(api_key=self.config["google_api_key"])
            
            print("Configuring Portia...")
            portia_config = Config.from_default(
                storage_class=StorageClass.CLOUD,
                default_log_level=LogLevel.INFO,
                llm_provider=LLMProvider.GOOGLE_GENERATIVE_AI,
                llm_model_name="GEMINI_1_5_FLASH",
                api_key=self.config["portia_api_key"]
            )
            
            # Create the Tavily search tool
            search_tool = TavilySearchTool(api_key=self.config["tavily_api_key"])
            print(f"Created custom Tavily search tool: {search_tool.id}")
            
            # Initialize Portia with the tools
            self.portia_instance = Portia(config=portia_config, tools=[search_tool])
            
            print("-" * 30)
            print(f"Portia initialized successfully!")
            print(f"Using LLM Provider: {self.portia_instance.config.llm_provider}")
            try:
                resolved_default_model = self.portia_instance.config.model("default_model_name")
                print(f"Resolved Default Model: {resolved_default_model.name} ({resolved_default_model.api_name})")
            except Exception as e:
                print(f"Could not resolve default model details: {e}")
            print("-" * 30)
            
        except Exception as e:
            print(f"Error setting up Portia with search tool: {e}")
            traceback.print_exc()
            self.portia_instance = None
    
    def search(self, query):
        """Search the web using Portia with the Tavily search tool"""
        if not self.portia_instance:
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

            plan_run = self.portia_instance.run(query=run_prompt)

            print("\n--- Portia Run Finished ---")
            print(f"Run State: {plan_run.state}")

            return self._extract_result(plan_run)

        except Exception as e:
            print(f"An unexpected error occurred during Portia run: {e}")
            traceback.print_exc()
            return f"Portia run failed with unexpected error: {e}"
    
    def _extract_result(self, plan_run):
        """Extract the final result from the Portia run object"""
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
            return f"Agent needs clarification to proceed: {plan_run.clarifications}"
        else:
            return f"Search process did not complete successfully. Final state: {plan_run.state}" 