"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BookmarkIcon, BookmarkFilledIcon } from "@radix-ui/react-icons"
import { useToast } from "@/components/ui/use-toast"

export default function ClientResults({ id }: { id: string }) {
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load results from localStorage for static export
    const loadFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem('lastAnalysis')
        if (stored) {
          const parsedResult = JSON.parse(stored)
          setAnalysisResult(parsedResult)
          setIsLoading(false)
          
          // Also load thinking process if available
          const thinking = localStorage.getItem('lastThinkingProcess')
          if (thinking) {
            // You can use this for showing thinking process
            console.log("Thinking process available")
          }
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error)
        setIsLoading(false)
      }
    }

    loadFromLocalStorage()
  }, [id])

  const handleToggleSave = () => {
    setIsSaved(!isSaved)
    toast({
      title: isSaved ? "Removed from saved" : "Saved successfully",
      description: isSaved ? "Analysis removed from your saved items" : "Analysis added to your saved items",
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading analysis results...</p>
      </div>
    )
  }

  if (!analysisResult) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Analysis result not found or has been deleted.</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Analyse New Content
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "High Risk", color: "bg-red-500" }
    if (score >= 50) return { level: "Medium Risk", color: "bg-yellow-500" }
    return { level: "Low Risk", color: "bg-green-500" }
  }

  // Use optional chaining for safety since we're loading from localStorage
  const overallScore = analysisResult.judgment === "ERROR" ? 50 : (analysisResult.result?.overallScore || 0)
  const risk = getRiskLevel(overallScore)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Detailed Results</h2>
        <Button variant="outline" size="icon" onClick={handleToggleSave}>
          {isSaved ? <BookmarkFilledIcon className="h-5 w-5 text-blue-600" /> : <BookmarkIcon className="h-5 w-5" />}
          <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
        </Button>
      </div>

      {analysisResult.judgment === "ERROR" ? (
        <Card className="mb-8 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Error Processing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">{analysisResult.judgment_reason || "An error occurred during analysis."}</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Content Analysed</CardTitle>
              <CardDescription>The text that was submitted for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-800">{analysisResult.content || "No content available"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Overall Assessment</CardTitle>
              <CardDescription>Summary of the misinformation analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${risk.color} text-white font-bold text-xl`}
                  >
                    {overallScore}%
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{risk.level} of Misinformation</h3>
                  <p className="text-gray-600">
                    This content has been identified as potentially misleading based on our analysis.
                  </p>
                </div>
              </div>
              <Progress value={overallScore} className="h-2" />
            </CardContent>
          </Card>

          {analysisResult.fact_checks && analysisResult.fact_checks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fact Checking</CardTitle>
                <CardDescription>Results of fact checking analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.fact_checks.map((check: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded-lg bg-gray-50">
                      <p className="font-medium mb-2">
                        {check.question?.question || `Fact Check ${idx + 1}`}
                      </p>
                      {check.analysis && (
                        <div className="mt-2">
                          <span className="font-medium">Status: </span>
                          <span className={check.analysis.verification_status === "true" ? "text-green-600" : check.analysis.verification_status === "false" ? "text-red-600" : "text-yellow-600"}>
                            {check.analysis.verification_status === "true" ? "Verified" : check.analysis.verification_status === "false" ? "False" : "Uncertain"}
                          </span>
                          <p className="text-sm text-gray-700 mt-1">{check.analysis.reasoning}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Button className="mt-8" onClick={() => router.push("/")}>
        Analyse Another Text
      </Button>
    </div>
  )
} 