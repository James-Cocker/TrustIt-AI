// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002';

export interface ProcessResponse {
  initial_questions?: string[];
  fact_checks?: any[];
  follow_up_questions?: any[];
  recommendations?: string[];
  judgment?: string;
  judgment_reason?: string;
  metadata?: {
    confidence_scores?: {
      question_generator?: number;
      fact_checking?: number;
      follow_up_generator?: number;
      judge?: number;
    }
  };
  error?: string;
}

export async function processContent(content: string, sessionId?: string): Promise<ProcessResponse> {
  try {
    console.log('Sending request to:', `${API_BASE_URL}/api/process`);
    console.log('Content:', content);
    
    const requestBody: any = { content };
    
    // Add sessionId to request if provided
    if (sessionId) {
      requestBody.sessionId = sessionId;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error processing content:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      initial_questions: [],
      fact_checks: []
    };
  }
} 