import requests
from pydantic import BaseModel, Field

class TavilySearchArgs(BaseModel):
    """Input schema for Tavily search tool"""
    search_query: str = Field(
        description="The query to search for. For example, 'what is the capital of France?'"
    )

class TavilySearchTool:
    """Tavily search tool implementation for Portia"""
    
    def __init__(self, api_key):
        self.args_schema = TavilySearchArgs
        self.api_key = api_key
        self.id = "tavily_search"
        self.name = "Tavily Search"
        self.description = "Searches the internet using Tavily to find answers to the search query provided."
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
        
        try:
            return self._execute_search(search_query)
        except Exception as e:
            error_message = f"Tavily search failed: {str(e)}"
            print(f"Error: {error_message}")
            return error_message
    
    def _execute_search(self, search_query):
        """Execute the actual search request to Tavily API"""
        url = "https://api.tavily.com/search"
        headers = {
            "content-type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        payload = {
            "query": search_query,
            "search_depth": "basic",
            "include_answer": True,
            "include_images": False,
            "include_raw_content": False,
            "max_results": 5
        }
        
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return self._format_results(search_query, response.json())
    
    def _format_results(self, search_query, results):
        """Format the search results into a readable string"""
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