import os
import sys
from pathlib import Path
from dotenv import load_dotenv

def load_config():
    """Load environment variables and API keys"""
    # Get the absolute path to the backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to .env in the backend directory
    env_path = os.path.join(backend_dir, '.env')
    
    # Load the .env file
    load_dotenv(env_path)
    print(f"Loading environment variables from: {env_path}")
    
    # Check if keys are loaded
    google_key = os.getenv("GOOGLE_API_KEY")
    portia_key = os.getenv("PORTIA_API_KEY")
    tavily_key = os.getenv("TAVILY_API_KEY")
    
    print(f"GOOGLE_API_KEY found: {'Yes' if google_key else 'No'}")
    print(f"PORTIA_API_KEY found: {'Yes' if portia_key else 'No'}")
    print(f"TAVILY_API_KEY found: {'Yes' if tavily_key else 'No'}")
    
    config = {
        "google_api_key": google_key,
        "portia_api_key": portia_key,
        "tavily_api_key": tavily_key
    }
    
    # Validate required keys
    missing_keys = [k for k, v in config.items() if not v]
    if missing_keys:
        error_msg = f"Missing required API keys: {', '.join(missing_keys)}"
        print(f"ERROR: {error_msg}")
        raise ValueError(error_msg)
    
    print("All required API keys found.")
    return config 