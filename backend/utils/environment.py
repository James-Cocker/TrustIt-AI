import os
import sys
import subprocess

def setup_environment():
    """
    Check if running in Portia virtual environment and switch to it if not.
    This ensures the script runs in the appropriate Python environment.
    """
    if not os.path.exists(os.path.join(os.path.dirname(sys.executable), 'activate')):
        print("Not running in Portia virtual environment. Attempting to relaunch...")
        try:
            portia_env_python = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                           "..", "portia-env-py311", "bin", "python")
            
            # Re-execute the current script with the Portia environment's Python
            subprocess.run([portia_env_python, sys.argv[0]])
            sys.exit(0)  # Exit the current instance of the script
        except Exception as e:
            print(f"Failed to execute in Portia environment: {e}")
            sys.exit(1) 