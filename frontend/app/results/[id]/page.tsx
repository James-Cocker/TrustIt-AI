"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

// Mock data for the analysis result
const mockAnalysisResult = {
  content: "Breaking news: Scientists discover that drinking coffee can cure cancer according to a new study.",
  overallScore: 85, // Higher score means higher likelihood of misinformation (0-100)
  agents: {
    linguistic: {
      score: 90,
      findings: [
        "Uses sensationalist language ('Breaking news')",
        "Makes absolute claims ('can cure cancer')",
        "Lacks specific details about the study",
        "Uses emotional language to engage readers",
      ],
    },
    factChecking: {
      score: 80,
      findings: [
        "No specific study cited or referenced",
        "No medical journal mentioned",
        "Contradicts established medical consensus",
        "Similar claims have been debunked by medical authorities",
      ],
    },
    sentiment: {
      score: 75,
      findings: [
        "Content designed to elicit hope in vulnerable populations",
        "Uses emotional manipulation techniques",
        "Creates false sense of breakthrough",
      ],
    },
    sources: {
      score: 95,
      findings: [
        "No credible sources cited",
        "No expert quotes or references",
        "No links to original research",
        "Cannot be verified by external sources",
      ],
    },
  },
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    // In a real implementation, this would fetch the analysis result from your backend
    // const fetchAnalysisResult = async () => {
    //   try {
    //     const response = await fetch(`/api/analysis/${params.id}`)
    //     const data = await response.json()
    //     setAnalysisResult(data)
    //   } catch (error) {
    //     console.error('Error fetching analysis result:', error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }

    // Replace the mock data fetching with a real API call

    // Change this:
    // Simulate API call with timeout and mock data
    const fetchAnalysisResult = async () => {
      try {
        const response = await fetch(`https://your-fastapi-backend.com/api/analysis/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch analysis result")
        }

        const data = await response.json()
        setAnalysisResult(data)
      } catch (error) {
        console.error("Error fetching analysis result:", error)
        // Handle error state here
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysisResult()
  }, [params.id, user, loading, router])

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Analysis Results</h1>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading analysis results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analysisResult) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Analysis Results</h1>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Analysis result not found or has been deleted.</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Analyze New Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "High Risk", color: "bg-red-500" }
    if (score >= 50) return { level: "Medium Risk", color: "bg-yellow-500" }
    return { level: "Low Risk", color: "bg-green-500" }
  }

  const risk = getRiskLevel(analysisResult.overallScore)

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analysis Results</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Content Analyzed</CardTitle>
            <CardDescription>The text that was submitted for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-gray-800">{analysisResult.content}</p>
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
                  {analysisResult.overallScore}%
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{risk.level} of Misinformation</h3>
                <p className="text-gray-600">
                  This content has been identified as potentially misleading based on our analysis.
                </p>
              </div>
            </div>
            <Progress value={analysisResult.overallScore} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
            <CardDescription>Breakdown of the analysis by different AI agents</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="linguistic">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="linguistic">Linguistic</TabsTrigger>
                <TabsTrigger value="factChecking">Fact Checking</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="sources">Sources</TabsTrigger>
              </TabsList>

              {Object.entries(analysisResult.agents).map(([key, agent]: [string, any]) => (
                <TabsContent key={key} value={key}>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getRiskLevel(agent.score).color} text-white font-bold mr-3`}
                      >
                        {agent.score}%
                      </div>
                      <h3 className="text-lg font-semibold">{getRiskLevel(agent.score).level}</h3>
                    </div>

                    <Progress value={agent.score} className="h-2 mb-4" />

                    <h4 className="font-medium">Key Findings:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {agent.findings.map((finding: string, index: number) => (
                        <li key={index} className="text-gray-700">
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
