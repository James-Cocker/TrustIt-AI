# TrustIt-AI Search Application

A web search application using Portia and Tavily to provide reliable search results.

## Overview

This application integrates Portia's agent capabilities with Tavily's search API to create a powerful and trustworthy search tool. The application is designed with modularity and maintainability in mind, following software engineering best practices.

## Features

- Web search using Tavily's search API
- Agent-based search orchestration with Portia
- Command-line interface for easy search queries
- Modular codebase with separation of concerns

## Setup

### Prerequisites

- Python 3.11 or higher
- API keys for:
  - Google Generative AI (Gemini)
  - Portia
  - Tavily

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/TrustIt-AI.git
   cd TrustIt-AI
   ```

2. Set up a virtual environment
   ```
   python -m venv portia-env-py311
   source portia-env-py311/bin/activate  # On Windows: portia-env-py311\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install portia-ai python-dotenv google-generativeai requests pydantic
   ```

4. Create a `.env` file in the project root with the following API keys:
   ```
   GOOGLE_API_KEY=your_google_api_key
   PORTIA_API_KEY=your_portia_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

## Usage

The application now follows a two-step process:

1.  **Question Generation:** Takes your initial query and uses Google Gemini to generate several specific sub-questions.
2.  **Iterative Search:** Uses Portia and the Tavily Search tool to search the web for answers to each generated sub-question.
3.  **Aggregation:** Combines the results from all sub-searches into a final output.

### Command Line Interface

Run a search query from the command line:

```
python -m backend.cli "your search query here"
```

For example:
```
python -m backend.cli "who is the current UK prime minister"
```

### Importing as a Module

You can also use the search functionality in your own code:

```python
from backend.config import load_config
from backend.services import PortiaSearchService

# Load configuration and initialize service
config = load_config()
search_service = PortiaSearchService(config)

# Run a search
results = search_service.search("your search query")
print(results)
```

## Code Structure

The application follows a modular design:

- `backend/` - Main package
  - `config.py` - Configuration loading and management
  - `main.py` - Main entry point for the application
  - `cli.py` - Command-line interface
  - `tools/` - Tool implementations
    - `tavily_search.py` - Tavily search tool implementation
  - `services/` - Service classes
    - `search_service.py` - Portia search service
  - `utils/` - Utility functions
    - `environment.py` - Environment setup utilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
