import traceback
import google.generativeai as genai

from portia import Portia, Config, StorageClass, LogLevel, LLMProvider
from backend.tools import TavilySearchTool
from backend.agents import QuestionGeneratorAgent

class PortiaSearchService:
    """Service to handle Portia initialization and search functionality"""
    
    def __init__(self, config):
        self.config = config
        self.portia_instance = None
        self.question_agent = QuestionGeneratorAgent(config)
        self._initialize_portia()
    
    def _initialize_portia(self):
        """Initialize Portia with the search tool"""
        try:
            if "google_api_key" in self.config:
                genai.configure(api_key=self.config["google_api_key"])
            else:
                raise ValueError("Google API Key is required for Portia setup.")
            
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
    
    def search(self, query: str) -> str:
        """
        Generate sub-questions, search the web for each using Portia, 
        and aggregate the results.
        """
        if not self.portia_instance:
            return "Error: Portia instance is not available."
        
        # 1. Generate sub-questions
        sub_questions = self.question_agent.generate_questions(query)
        
        all_results = []
        print(f"\n--- Searching for {len(sub_questions)} Sub-Questions ---")
        
        # 2. Loop through sub-questions and search
        for i, sub_q in enumerate(sub_questions):
            print(f"\n[{i+1}/{len(sub_questions)}] Searching for: '{sub_q}'")
            print("-" * 20)
            try:
                # Use Portia to run the search for the sub-question
                # We tell Portia to use the tool and focus on the specific sub-question
                run_prompt = (
                    f"Use the Tavily Search tool to find information specifically about: '{sub_q}'. "
                    f"Provide a detailed answer based on the search results."
                )
                
                plan_run = self.portia_instance.run(query=run_prompt)
                
                print(f"\n--- Portia Run Finished for '{sub_q}' --- State: {plan_run.state}")
                result = self._extract_result(plan_run)
                all_results.append(result)
                print(f"Result for '{sub_q}':\n{result[:200]}...\n") # Print snippet

            except Exception as e:
                error_message = f"Error during search for '{sub_q}': {e}"
                print(error_message)
                traceback.print_exc()
                all_results.append(f"Search failed for question: {sub_q}")
                
        print("--- All Sub-Searches Completed ---")
        
        # 3. Aggregate and synthesize results (Optional: Use another Gemini call for synthesis)
        # For now, just concatenate the results
        final_aggregate = f"Combined results for the initial query: '{query}'\n\n"
        final_aggregate += "\n\n---\n\n".join(all_results)
        
        # Optional: Add a synthesis step here using Gemini if needed
        # synthesized_answer = self._synthesize_results(query, all_results)
        # return synthesized_answer
        
        return final_aggregate
    
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
            return "No final output found in completed run."
        elif plan_run.state == "CLARIFICATION":
            return f"Agent needs clarification: {plan_run.clarifications}"
        else:
            # Try to get step outputs even if not complete
            if hasattr(plan_run, 'outputs') and hasattr(plan_run.outputs, 'step_outputs'):
                if plan_run.outputs.step_outputs:
                    first_key = next(iter(plan_run.outputs.step_outputs))
                    step_output = plan_run.outputs.step_outputs[first_key]
                    if hasattr(step_output, 'value'):
                         return f"Run ended in state {plan_run.state}, but found step output: {step_output.value}"
            return f"Search process ended in state: {plan_run.state}. No usable output found."

    # Optional: Add a synthesis method if desired
    # def _synthesize_results(self, original_query: str, results: list[str]) -> str:
    #     """Use Gemini to synthesize the collected results into a final answer."""
    #     print("\n--- Synthesizing Final Answer ---")
    #     try:
    #         model = genai.GenerativeModel('gemini-1.5-pro') # Use a more powerful model for synthesis
    #         combined_results = "\n\n".join(results)
    #         prompt = (
    #             f"Based on the original query: '{original_query}' and the following search results collected for sub-questions:\n\n"
    #             f"{combined_results}\n\n"
    #             f"Please synthesize this information into a single, comprehensive, and well-structured answer to the original query. "
    #             f"Avoid simply listing the results; integrate the information smoothly."
    #         )
    #         response = model.generate_content(prompt)
    #         return response.text
    #     except Exception as e:
    #         print(f"Error during synthesis: {e}")
    #         traceback.print_exc()
    #         return "Synthesis failed. Returning combined raw results:\n\n" + "\n\n---\n\n".join(results) 