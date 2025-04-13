"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { 
  Loader2, 
  Send, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCcw, 
  RotateCcw,
  ArrowUpRight,
  PlusCircle,
  Search,
  Terminal
} from "lucide-react"
import { processContent } from "@/lib/api"
import Pusher from 'pusher-js'
import React from 'react'
import { useAuth } from "@/hooks/use-auth"
import { saveAnalysisResult } from "@/lib/supabase/database"
// Removed framer-motion imports that were causing issues

// Keep the same interfaces from your original code
interface FactCheckAnalysis {
  verification_status: string;
  confidence_score: number;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  reasoning: string;
  evidence_gaps: string[];
  recommendations: string[];
  sources: string[];
}

interface FactCheck {
  question: { question: string };
  analysis: FactCheckAnalysis;
}

interface AnalysisResult {
  initial_questions?: string[];
  fact_checks?: FactCheck[];
  follow_up_questions?: string[];
  recommendations?: string[];
  metadata?: any;
  judgment?: string;
  judgment_reason?: string;
  error?: string;
}

interface ConversationMessage {
  id: string;
  type: 'query' | 'response';
  content: string | AnalysisResult;
}

// New interfaces for Pusher updates
interface ProcessUpdate {
  message: string;
  detail?: string;
  stage: string;
  progress: number;
  timestamp?: number;
  plan?: string;
  questions?: string[];
  question?: string;
  question_number?: number;
  result?: any;
  judgment?: string;
  confidence?: number;
  reason?: string;
  error?: string;
  operation?: string;
  tool?: string;
  step?: string;
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  // Cast params to the correct type for React.use() and extract the id
  const { id } = React.use(params as any) as { id: string };
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [originalQuery, setOriginalQuery] = useState<string>("")
  const [followUpQuestion, setFollowUpQuestion] = useState("")
  const [isProcessingFollowUp, setIsProcessingFollowUp] = useState(false)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [processingQueryId, setProcessingQueryId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({})
  const [activeView, setActiveView] = useState<'conversation' | 'summary'>('conversation')
  const [progressUpdates, setProgressUpdates] = useState<ProcessUpdate[]>([])
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [currentStage, setCurrentStage] = useState<string>('waiting')
  const [showProcessLog, setShowProcessLog] = useState<boolean>(false)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pusherRef = useRef<any>(null)
  
  // Add a request cache ref to prevent duplicate API calls
  const requestCacheRef = useRef<{[key: string]: Promise<any>}>({})
  
  const router = useRouter()

  // Add user from auth context
  const { user } = useAuth();

  // Initialize Pusher when the component mounts
  useEffect(() => {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;
    
    pusherRef.current = new Pusher('4cdf071584bc2fb15aa8', {
      cluster: 'eu'
    });
    
    // Cleanup on unmount
    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, []);

  // Toggle expanded state for a specific section
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [followUpQuestion]);

  // Initial data loading
  useEffect(() => {
    // Get the original query from localStorage
    const savedQuery = localStorage.getItem('lastQuery')
    if (savedQuery) {
      setOriginalQuery(savedQuery)
      // Add the original query to the conversation with a unique ID
      const queryId = "initial-query";
      setConversation([{ id: queryId, type: 'query', content: savedQuery }])
      setProcessingQueryId(queryId)
      
      // Check if we already have results in localStorage
      const savedAnalysis = localStorage.getItem('lastAnalysis')
      if (savedAnalysis) {
        try {
          const parsedResult = JSON.parse(savedAnalysis);
          console.log("Parsed result from localStorage:", parsedResult);
          setResult(parsedResult);
          // Add the response with a reference to the query
          setConversation(prev => [...prev, { id: `response-${queryId}`, type: 'response', content: parsedResult }]);
          setLoading(false);
          setProcessingQueryId(null);
        } catch (e) {
          console.error("Error parsing saved analysis:", e);
          // Handle potential parsing error (e.g., invalid JSON)
          setResult({ error: "Failed to load saved analysis results." });
          setConversation(prev => [...prev, { id: `response-${queryId}`, type: 'response', content: { error: "Failed to load saved analysis results." } }]);
          setLoading(false);
          setProcessingQueryId(null);
        }
      } else {
        // If we have a query but no results yet, start processing
        processUserQuery(savedQuery, queryId);
      }
    } else {
      setLoading(false);
    }
  }, [])

  // Setup Pusher subscription for this specific session
  useEffect(() => {
    if (!id || !pusherRef.current) return;
    
    // Subscribe to the channel for this specific fact-check session
    const channel = pusherRef.current.subscribe(`fact-check-${id}`);
    
    // Listen for all possible event types
    const eventTypes = [
      'process_started', 'status_update', 'portia_planning', 
      'portia_plan_created', 'portia_plan_complete', 'not_enough_context', 
      'questions_generated', 'fact_checking_started', 'checking_question',
      'fact_checking_complete', 'fact_check_result', 'judging_started',
      'judgment_complete', 'process_complete', 'error', 'portia_internal'
    ];
    
    // Generic handler for all events
    const handleUpdate = (data: ProcessUpdate) => {
      console.log('Received update:', data);
      
      // Add to progress updates
      setProgressUpdates(prev => [...prev, data]);
      
      // Update progress percentage if available
      if (data.progress !== undefined) {
        setProgressPercent(data.progress);
      }
      
      // Update current stage
      if (data.stage) {
        setCurrentStage(data.stage);
      }
      
      // Handle complete event - update final result
      if (data.stage === 'complete' && data.result) {
        setResult(data.result);
        setLoading(false);
        setProcessingQueryId(null);
        
        // Save result to localStorage
        localStorage.setItem('lastAnalysis', JSON.stringify(data.result));
        
        // If user is logged in, save the result to the database
        if (user && originalQuery) {
          try {
            // Get the judgment from the result
            let judgment = data.result.judgment?.toUpperCase() || 'UNCERTAIN';
            
            // Ensure judgment is one of our expected values
            if (!['REAL', 'FAKE', 'MISLEADING', 'UNCERTAIN'].includes(judgment)) {
              // Map any unexpected values to our standard judgments
              if (judgment.includes('REAL') || judgment.includes('TRUE') || judgment.includes('VERIFIED')) {
                judgment = 'REAL';
              } else if (judgment.includes('FAKE') || judgment.includes('FALSE')) {
                judgment = 'FAKE';
              } else if (judgment.includes('MISLEADING') || judgment.includes('PARTIALLY')) {
                judgment = 'MISLEADING';
              } else {
                judgment = 'UNCERTAIN';
              }
            }
            
            // Convert to expected format for database
            const formattedResult = {
              ...data.result,
              judgment: judgment, // Use our sanitized judgment value
              overallScore: data.result.metadata?.confidence_scores?.judge * 100 || 50, // Scale to 0-100
              status: "completed"
            };
            
            // Save to database with the current ID
            saveAnalysisResult(user.id, originalQuery, formattedResult)
              .then(savedId => {
                console.log('Analysis saved to database:', savedId);
              })
              .catch(err => {
                console.error('Failed to save analysis to database:', err);
              });
          } catch (error) {
            console.error('Error preparing analysis for database:', error);
          }
        }
        
        // Add to conversation if not already there
        const queryId = "initial-query";
        setConversation(prev => {
          // Check if we already have this response
          if (!prev.some(m => m.id === `response-${queryId}`)) {
            return [...prev, { id: `response-${queryId}`, type: 'response', content: data.result }];
          }
          return prev;
        });
      }
      
      // Handle error case
      if (data.stage === 'error') {
        setLoading(false);
        setProcessingQueryId(null);
      }
    };
    
    // Register handlers for all event types
    eventTypes.forEach(eventType => {
      channel.bind(eventType, handleUpdate);
    });
    
    // Cleanup on unmount or id change
    return () => {
      eventTypes.forEach(eventType => {
        channel.unbind(eventType, handleUpdate);
      });
      pusherRef.current.unsubscribe(`fact-check-${id}`);
    };
  }, [id]);

  // This function processes the original query or follow-up questions
  const processUserQuery = async (query: string, queryId: string) => {
    try {
      // If we're already processing this exact query, return the existing promise
      const cacheKey = `${query}:${queryId}`;
      if (cacheKey in requestCacheRef.current) {
        console.log(`Using cached request for ${cacheKey}`);
        return await requestCacheRef.current[cacheKey];
      }
      
      setLoading(true);
      setProcessingQueryId(queryId);
      
      // Reset progress tracking for new queries
      setProgressUpdates([]);
      setProgressPercent(0);
      setCurrentStage('waiting');
      
      // Create a promise for the processing and store it in the cache
      const processPromise = processContent(query, id).then(result => {
        if (result.error) {
          throw new Error(result.error);
        }

        // Store the analysis result in localStorage (only for the initial query)
        if (queryId === "initial-query") {
          localStorage.setItem('lastAnalysis', JSON.stringify(result));
        }
        
        // Update state with new results
        setResult(result);
        
        // Update the conversation with the new response
        setConversation(prev => {
          // Find if we already have a response for this query
          const existingResponseIndex = prev.findIndex(msg => msg.id === `response-${queryId}`);
          
          if (existingResponseIndex !== -1) {
            // Replace the existing response
            const updatedConversation = [...prev];
            updatedConversation[existingResponseIndex] = { 
              id: `response-${queryId}`, 
              type: 'response', 
              content: result 
            };
            return updatedConversation;
          } else {
            // Add a new response
            return [...prev, { id: `response-${queryId}`, type: 'response', content: result }];
          }
        });
        
        return result;
      }).catch(error => {
        const errorMessage = error instanceof Error ? error.message : "There was an error analysing your content.";
        const errorResult = { error: errorMessage, initial_questions: [], fact_checks: [] };
        
        // Update the conversation with the error
        setConversation(prev => {
          // Find if we already have a response for this query
          const existingResponseIndex = prev.findIndex(msg => msg.id === `response-${queryId}`);
          
          if (existingResponseIndex !== -1) {
            // Replace the existing response
            const updatedConversation = [...prev];
            updatedConversation[existingResponseIndex] = { 
              id: `response-${queryId}`, 
              type: 'response', 
              content: errorResult 
            };
            return updatedConversation;
          } else {
            // Add a new response
            return [...prev, { id: `response-${queryId}`, type: 'response', content: errorResult }];
          }
        });
        
        throw error;
      }).finally(() => {
        // Only update loading state if we didn't get streamed updates
        if (progressPercent < 100) {
          setLoading(false);
          setProcessingQueryId(null);
        }
        
        // Remove this request from the cache after it's complete
        delete requestCacheRef.current[cacheKey];
      });
      
      // Store the promise in the cache
      requestCacheRef.current[cacheKey] = processPromise;
      
      // Await the promise and return its result
      return await processPromise;
    } catch (error) {
      console.error("Error in processUserQuery:", error);
      setLoading(false);
      setProcessingQueryId(null);
      throw error;
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim()) return;
    
    // Generate a unique ID for this follow-up question
    const queryId = `follow-up-${Date.now()}`;
    
    // Add the follow-up question to the conversation
    setConversation(prev => [...prev, { id: queryId, type: 'query', content: followUpQuestion }]);
    
    // Process the follow-up question
    setIsProcessingFollowUp(true);
    await processUserQuery(followUpQuestion, queryId);
    setIsProcessingFollowUp(false);
    
    // Clear the input field
    setFollowUpQuestion('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Helper function to get the appropriate color for the judgment
  const getJudgmentColor = (judgment: string) => {
    switch(judgment?.toLowerCase()) {
      case 'real':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'fake':
        return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200';
      case 'uncertain':
      default:
        return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200';
    }
  }

  // Get verification color
  const getVerificationColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('true') || statusLower.includes('verified')) {
      return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    } 
    if (statusLower.includes('false') || statusLower.includes('misleading')) {
      return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
    }
    return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
  }

  // Get judgment icon based on verdict
  const getJudgmentIcon = (judgment: string) => {
    switch(judgment?.toLowerCase()) {
      case 'real':
        return <CheckCircle2 className="w-10 h-10 text-green-600 drop-shadow-md" />;
      case 'fake':
        return <XCircle className="w-10 h-10 text-red-600 drop-shadow-md" />;
      case 'uncertain':
      default:
        return <AlertTriangle className="w-10 h-10 text-yellow-600 drop-shadow-md" />;
    }
  }

  // Get the confidence score for judgment
  const getJudgmentConfidence = (result: AnalysisResult) => {
    return result?.metadata?.confidence_scores?.judge 
      ? `${(result.metadata.confidence_scores.judge * 100).toFixed(0)}%`
      : result?.fact_checks && result.fact_checks.length > 0 
        ? `${(result.fact_checks.reduce((sum, fact) => sum + (fact.analysis?.confidence_score || 0), 0) / result.fact_checks.length * 100).toFixed(0)}%`
        : 'N/A';
  }

  // Render a single message (query or response)
  const renderMessage = (message: ConversationMessage, index: number) => {
    if (message.type === 'query') {
      return (
        <div 
          key={message.id} 
          className="p-4 mb-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <div className="bg-gray-200 rounded-full p-2 mt-0.5">
              <Search className="h-4 w-4 text-gray-700" />
            </div>
            <p className="font-medium text-gray-800">{message.content as string}</p>
          </div>
        </div>
      );
    } else {
      const responseContent = message.content as AnalysisResult;
      const messageId = message.id;
      
      if (responseContent.error) {
        return (
          <div
            key={message.id}
            className="animate-fadeIn"
          >
            <Alert variant="destructive" className="rounded-xl shadow-sm">
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{responseContent.error}</AlertDescription>
            </Alert>
          </div>
        );
      }

      // Return simplified view with expandable sections
      return (
        <div 
          key={message.id} 
          className="mb-8 space-y-4 animate-fadeIn"
        >
          {/* Final Judgment Section - Always shown */}
          {responseContent.judgment && (
            <div 
              className={`p-5 rounded-2xl border shadow-sm ${getJudgmentColor(responseContent.judgment)} animate-scaleIn`}
            >
              <div className="flex items-center gap-4">
                {getJudgmentIcon(responseContent.judgment)}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold">
                      {responseContent.judgment.toUpperCase()}
                    </h2>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">Confidence</div>
                      <div className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {getJudgmentConfidence(responseContent)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expandable reasoning */}
              {responseContent.judgment_reason && (
                <div className="mt-4">
                  <Button 
                    variant="ghost" 
                    className="px-0 h-auto text-sm font-medium flex items-center gap-1 hover:bg-transparent hover:opacity-80 transition-opacity"
                    onClick={() => toggleSection(`${messageId}-reasoning`)}
                  >
                    <span className={`transition-transform duration-200 ${expandedSections[`${messageId}-reasoning`] ? 'rotate-0' : 'rotate-90'}`}>
                      {expandedSections[`${messageId}-reasoning`] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </span>
                    Reasoning
                  </Button>
                  
                  {expandedSections[`${messageId}-reasoning`] && (
                    <div 
                      className="mt-3 ml-5 pl-3 text-sm border-l-2 border-gray-200 animate-expandDown"
                    >
                      <p className="text-gray-700">{responseContent.judgment_reason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Initial Questions - Expandable Section */}
          <div 
            className="border rounded-xl overflow-hidden shadow-sm bg-white animate-fadeIn"
          >
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 rounded-none hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(`${messageId}-questions`)}
            >
              <span className="font-medium flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {responseContent.initial_questions?.length || 0}
                </span>
                Initial Questions Generated
              </span>
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  expandedSections[`${messageId}-questions`] ? 'rotate-0' : 'rotate-180'
                }`} 
              />
            </Button>
            
            {expandedSections[`${messageId}-questions`] && (
              <div className="overflow-hidden animate-expandDown">
                <div className="px-4 py-3 border-t border-gray-100">
                  {responseContent.initial_questions && responseContent.initial_questions.length > 0 ? (
                    <ul className="space-y-3">
                      {responseContent.initial_questions.map((question, idx) => (
                        <li key={`${message.id}-q-${idx}`} className="pl-6 relative">
                          <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {idx + 1}
                          </span>
                          <p className="text-gray-700">{question}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No initial questions were generated.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fact Checking Results - Simplified display with expandable details */}
          <div 
            className="border rounded-xl overflow-hidden shadow-sm bg-white animate-fadeIn"
          >
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 rounded-none hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(`${messageId}-facts`)}
            >
              <span className="font-medium flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {responseContent.fact_checks?.length || 0}
                </span>
                Fact Checking Results
              </span>
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  expandedSections[`${messageId}-facts`] ? 'rotate-0' : 'rotate-180'
                }`} 
              />
            </Button>
            
            {expandedSections[`${messageId}-facts`] && (
              <div className="overflow-hidden animate-expandDown">
                <div className="p-4 border-t border-gray-100">
                  {responseContent.fact_checks && responseContent.fact_checks.length > 0 ? (
                    <div className="space-y-4">
                      {responseContent.fact_checks.map((factCheck, idx) => (
                        <div key={`${message.id}-fc-${idx}`} className="border p-4 rounded-xl bg-gray-50/50 transition-shadow hover:shadow-sm">
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <h4 className="font-medium text-gray-800">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 mr-1.5">Q{idx+1}</span>
                              {factCheck.question?.question || "Question not available"}
                            </h4>
                            
                            {/* Status indicator with appropriate color */}
                            <div 
                              className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                                getVerificationColor(factCheck.analysis?.verification_status)
                              }`}
                            >
                              {factCheck.analysis?.verification_status || "N/A"}
                            </div>
                          </div>
                          
                          {/* Expandable detailed evidence */}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="px-0 h-auto text-sm font-medium flex items-center gap-1 hover:bg-transparent hover:opacity-80 transition-opacity"
                            onClick={() => toggleSection(`${messageId}-fact-${idx}`)}
                          >
                            <span className={`transition-transform duration-200 ${expandedSections[`${messageId}-fact-${idx}`] ? 'rotate-0' : 'rotate-90'}`}>
                              {expandedSections[`${messageId}-fact-${idx}`] ? 
                                <ChevronDown className="h-4 w-4" /> : 
                                <ChevronRight className="h-4 w-4" />
                              }
                            </span>
                            <span className="text-indigo-600 font-medium">Show Details</span>
                          </Button>
                          
                          {expandedSections[`${messageId}-fact-${idx}`] && (
                            <div 
                              className="mt-3 pl-5 space-y-4 border-l-2 border-indigo-100 animate-expandDown"
                            >
                              {factCheck.analysis?.reasoning && (
                                <div>
                                  <p className="text-sm font-semibold text-gray-700">Reasoning:</p>
                                  <p className="text-sm text-gray-600 mt-1">{factCheck.analysis.reasoning}</p>
                                </div>
                              )}
                              
                              {factCheck.analysis?.supporting_evidence && factCheck.analysis.supporting_evidence.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-green-700">Supporting Evidence:</p>
                                  <ul className="mt-1 space-y-1.5">
                                    {factCheck.analysis.supporting_evidence.map((ev, i) => (
                                      <li key={`${message.id}-sup-${idx}-${i}`} className="text-sm text-green-600 flex items-start gap-1.5">
                                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{ev}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {factCheck.analysis?.contradicting_evidence && factCheck.analysis.contradicting_evidence.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-red-700">Contradicting Evidence:</p>
                                  <ul className="mt-1 space-y-1.5">
                                    {factCheck.analysis.contradicting_evidence.map((ev, i) => (
                                      <li key={`${message.id}-con-${idx}-${i}`} className="text-sm text-red-600 flex items-start gap-1.5">
                                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{ev}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {factCheck.analysis?.evidence_gaps && factCheck.analysis.evidence_gaps.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-yellow-700">Evidence Gaps:</p>
                                  <ul className="mt-1 space-y-1.5">
                                    {factCheck.analysis.evidence_gaps.map((ev, i) => (
                                      <li key={`${message.id}-gap-${idx}-${i}`} className="text-sm text-yellow-600 flex items-start gap-1.5">
                                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>{ev}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {factCheck.analysis?.sources && factCheck.analysis.sources.length > 0 && (
                                <div>
                                  <p className="text-sm font-semibold text-indigo-700">Sources:</p>
                                  <ul className="mt-1 space-y-1.5">
                                    {factCheck.analysis.sources.map((source, i) => (
                                      <li key={`${message.id}-src-${idx}-${i}`} className="text-sm flex items-start gap-1.5">
                                        <ArrowUpRight className="h-4 w-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                                        {source.startsWith('http') ? (
                                          <a 
                                            href={source} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                                          >
                                            {source}
                                          </a>
                                        ) : (
                                          <span className="text-gray-600">{source}</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No fact checks were performed or results are available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Render the progress log component
  const renderProgressLog = () => {
    if (!showProcessLog) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-900 text-gray-200 rounded-xl overflow-y-auto max-h-64 font-mono text-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-400 font-semibold">Processing Log</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white p-1 h-auto"
            onClick={() => setShowProcessLog(false)}
          >
            Hide
          </Button>
        </div>
        <div className="space-y-2">
          {progressUpdates.map((update, i) => (
            <div key={i} className="border-l-2 border-gray-700 pl-3 py-1">
              <div className="flex justify-between">
                <span className="font-bold text-indigo-400">{update.stage}</span>
                {update.progress && (
                  <span className="text-gray-400">{update.progress}%</span>
                )}
              </div>
              <p className="text-gray-300">{update.message}</p>
              {update.plan && (
                <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                  {update.plan.substring(0, 200)}...
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
      <Card className="flex-grow flex flex-col overflow-hidden bg-white rounded-2xl shadow-lg border-0">
        <CardHeader className="border-b bg-white z-10 backdrop-blur-lg bg-opacity-90 sticky top-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2 font-bold">
              <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                <Search className="h-5 w-5" />
              </span>
              Fact Verification Results
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 rounded-lg border-gray-200"
                onClick={() => setShowProcessLog(!showProcessLog)}
              >
                <Terminal className="h-4 w-4" />
                {showProcessLog ? 'Hide Log' : 'Show Log'}
              </Button>
              
              {/* <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 rounded-lg border-gray-200"
                onClick={() => router.push('/')}
              >
                <PlusCircle className="h-4 w-4" />
                New Analysis
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1 rounded-lg border-gray-200"
                onClick={() => {
                  localStorage.removeItem('lastAnalysis');
                  localStorage.removeItem('lastQuery');
                  router.push('/');
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button> */}
            </div>
          </div>
          
          {/* Progress bar for processing */}
          {loading && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{currentStage}</span>
                <span className="text-gray-500">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Progress log */}
          {renderProgressLog()}
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto py-6 px-4 md:px-6">
          {/* Conversation Messages */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {conversation.map((message, index) => renderMessage(message, index))}
            
            {/* Loading Indicator */}
            {loading && progressUpdates.length > 0 && (
              <div 
                className="flex items-start gap-3 p-4 mb-4 bg-blue-50 rounded-xl border border-blue-100 animate-fadeIn shadow-sm"
              >
                <div className="mt-1">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
                <div className="flex-1">
                  {/* Main update message */}
                  <p className="text-blue-700 font-medium">
                    {progressUpdates[progressUpdates.length - 1]?.message || "Processing..."}
                  </p>
                  
                  {/* Detailed operation description */}
                  <p className="text-sm text-blue-500 mt-1">
                    {progressUpdates[progressUpdates.length - 1]?.detail || `Stage: ${currentStage} (${progressPercent}% complete)`}
                  </p>

                  {/* Show Portia's internal operations if available */}
                  {progressUpdates.length > 1 && 
                    progressUpdates
                      .slice(-8) // Get the last 8 updates
                      .filter(update => update.operation) // Only show those with operation property
                      .slice(-3) // Take just the 3 most recent operation updates
                      .map((update, i) => (
                        <div key={i} className="mt-2 p-2 bg-blue-100 rounded-lg text-xs font-mono">
                          <div className="flex items-center">
                            <span className="text-blue-800 font-semibold">{update.operation}:</span>
                            <span className="text-blue-600 ml-1">{update.message}</span>
                          </div>
                          {update.tool && (
                            <span className="block mt-1 text-blue-700">
                              <span className="font-semibold">Tool:</span> {update.tool}
                            </span>
                          )}
                          {update.step && (
                            <span className="block mt-1 text-blue-700 truncate">
                              <span className="font-semibold">Step:</span> {update.step.length > 50 ? update.step.substring(0, 50) + '...' : update.step}
                            </span>
                          )}
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
            
            {/* Basic loading indicator if no updates yet */}
            {loading && progressUpdates.length === 0 && (
              <div 
                className="flex items-center gap-3 p-4 mb-4 bg-blue-50 rounded-xl border border-blue-100 animate-fadeIn"
              >
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-blue-700">
                  {processingQueryId === "initial-query" 
                    ? "Analysing your content... This may take a moment."
                    : "Processing your follow-up question..."}
                </p>
              </div>
            )}
            
            {/* Bottom reference for auto-scrolling */}
            <div ref={bottomRef} />
          </div>
        </CardContent>
        
        {/* Follow-up Question Input */}
        <div className="p-4 border-t bg-gradient-to-b from-transparent to-gray-50">
          <form onSubmit={handleFollowUpSubmit} className="flex gap-3 max-w-4xl mx-auto">
            <div className="flex-grow relative">
              <Textarea 
                ref={textareaRef}
                placeholder="Ask a follow-up question..." 
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                className="resize-none py-3 pr-12 rounded-xl shadow-sm transition-shadow focus:shadow-md border-gray-200"
                disabled={loading || isProcessingFollowUp}
                rows={1}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={loading || isProcessingFollowUp || !followUpQuestion.trim()}
                className="absolute right-3 bottom-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isProcessingFollowUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}