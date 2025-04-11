"""
Main entry point for the Portia search application.
Initializes the environment, loads configuration, and runs the search service.
"""

from backend.utils import setup_environment
from backend.config import load_config
from backend.services import PortiaSearchService

def main():
    """Main function to run the application"""
    # Setup environment and configuration
    setup_environment()
    
    try:
        # Load configuration
        config = load_config()
        
        # Initialize search service
        search_service = PortiaSearchService(config)
        
        # Run a test search
        search_query = "who is uk prime minister?"
        final_answer = search_service.search(search_query)
        
        # Display results
        print("\n" + "="*40)
        print("      FINAL ANSWER FROM PORTIA SEARCH      ")
        print("="*40)
        print(final_answer)
        print("="*40)
        
    except Exception as e:
        print(f"\nApplication error: {e}")
        print("\n--- Portia initialization failed ---")
        print("Please ensure you have:")
        print("1. Installed the Portia package correctly")
        print("2. Set up valid API keys in the .env file:")
        print("   - PORTIA_API_KEY for Portia")
        print("   - TAVILY_API_KEY for Tavily search")
        print("   - GOOGLE_API_KEY for Gemini LLM")

if __name__ == "__main__":
    main() 