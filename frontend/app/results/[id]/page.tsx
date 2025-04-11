"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"
import { BookmarkIcon, BookmarkFilledIcon } from "@radix-ui/react-icons"
import { toggleSaveAnalysis } from "@/lib/supabase/database"
import { useToast } from "@/components/ui/use-toast"

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const fetchAnalysisResult = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("analyses").select("*").eq("id", params.id).single()

        if (error) throw error

        // Check if this analysis belongs to the current user
        if (data.user_id !== user.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this analysis",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setAnalysisResult(data)
        setIsSaved(data.saved)
      } catch (error) {
        console.error("Error fetching analysis result:", error)
        toast({
          title: "Error",
          description: "Failed to load analysis result",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchAnalysisResult()
    }
  }, [params.id, user, loading, router, toast])

  const handleToggleSave = async () => {
    if (!user || !analysisResult) return

    setIsSaving(true)

    try {
      await toggleSaveAnalysis(analysisResult.id, !isSaved)
      setIsSaved(!isSaved)
      toast({
        title: isSaved ? "Removed from saved" : "Saved successfully",
        description: isSaved ? "Analysis removed from your saved items" : "Analysis added to your saved items",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

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
                Analyse New Content
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

  const risk = getRiskLevel(analysisResult.result.overallScore)

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <Button variant="outline" size="icon" onClick={handleToggleSave} disabled={isSaving}>
            {isSaved ? <BookmarkFilledIcon className="h-5 w-5 text-blue-600" /> : <BookmarkIcon className="h-5 w-5" />}
            <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Content Analysed</CardTitle>
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
                  {analysisResult.result.overallScore}%
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{risk.level} of Misinformation</h3>
                <p className="text-gray-600">
                  This content has been identified as potentially misleading based on our analysis.
                </p>
              </div>
            </div>
            <Progress value={analysisResult.result.overallScore} className="h-2" />
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

              {Object.entries(analysisResult.result.agents).map(([key, agent]: [string, any]) => (
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
