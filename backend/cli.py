"""
Command-line interface for the Portia search application.
"""
import argparse
from backend.utils import setup_environment
from backend.config import load_config
from backend.services import PortiaSearchService

def cli():
    """Run the command-line interface for the search application"""
    parser = argparse.ArgumentParser(description="Search the web using Portia and Tavily")
    parser.add_argument("query", nargs="?", default="who is uk prime minister?", 
                        help="The search query to run (default: who is uk prime minister?)")
    
    args = parser.parse_args()
    
    # Setup environment and configuration
    setup_environment()
    
    try:
        # Load configuration
        config = load_config()
        
        # Initialize search service
        search_service = PortiaSearchService(config)
        
        # Run the search with the provided query
        final_answer = search_service.search(args.query)
        
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
    cli() 