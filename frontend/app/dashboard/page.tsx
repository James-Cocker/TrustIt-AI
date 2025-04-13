"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserAnalyses } from "@/lib/supabase/database"
import { RefreshCw } from "lucide-react"

interface Analysis {
  id: string
  content: string
  result: any
  created_at: string
  saved: boolean
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [savedAnalyses, setSavedAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    const fetchAnalyses = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const data = await getUserAnalyses(user.id)
        console.log("Fetched analyses:", data)
        setAnalyses(data)
        setSavedAnalyses(data.filter((analysis: Analysis) => analysis.saved))
      } catch (error) {
        console.error("Error fetching analyses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchAnalyses()
    }
  }, [user, loading, router, refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const getJudgmentInfo = (analysis: any) => {
    console.log("Getting judgment for analysis:", analysis)
    
    if (!analysis) {
      return { level: "UNCERTAIN", color: "bg-gray-500" }
    }
    
    if (analysis.status === "processing" || analysis.result?.status === "processing") {
      return { level: "PROCESSING", color: "bg-blue-500" };
    }
    
    let judgment = analysis?.judgment?.toUpperCase();
    
    if (!judgment && analysis?.result) {
      judgment = analysis.result?.judgment?.toUpperCase() ||
                analysis.result?.judgment_reason?.toUpperCase() ||
                "UNCERTAIN";
    }
    
    judgment = judgment || "UNCERTAIN";
    
    if (judgment === "PROCESSING") {
      return { level: "PROCESSING", color: "bg-blue-500" };
    }
    
    if (judgment.includes("REAL") || judgment.includes("TRUE") || judgment.includes("VERIFIED")) {
      judgment = "REAL";
    } else if (judgment.includes("FAKE") || judgment.includes("FALSE")) {
      judgment = "FAKE";
    } else if (judgment.includes("MISLEAD")) {
      judgment = "MISLEADING";
    } else if (judgment !== "UNCERTAIN") {
      judgment = "UNCERTAIN";
    }
    
    let color = "bg-gray-500"
    
    switch (judgment) {
      case "REAL":
        color = "bg-green-500"
        break
      case "FAKE":
        color = "bg-red-500"
        break
      case "MISLEADING":
        color = "bg-yellow-500"
        break
      case "UNCERTAIN":
      default:
        color = "bg-gray-500"
        break
    }
    
    return { level: judgment, color }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="recent">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent Analyses</TabsTrigger>
          <TabsTrigger value="saved">Saved Items</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : analyses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {analyses.map((analysis) => {
                const judgmentInfo = getJudgmentInfo(analysis);
                return (
                <Card key={analysis.id}>
                  <CardHeader>
                    <CardTitle className="truncate">{analysis.content.substring(0, 50)}...</CardTitle>
                    <CardDescription>Analysed {formatDate(analysis.created_at)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{analysis.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">

                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/results/${analysis.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't performed any analyses yet.</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Analyze New Content
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : savedAnalyses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedAnalyses.map((analysis) => {
                const judgmentInfo = getJudgmentInfo(analysis);
                return (
                <Card key={analysis.id}>
                  <CardHeader>
                    <CardTitle className="truncate">{analysis.content.substring(0, 50)}...</CardTitle>
                    <CardDescription>Analysed {formatDate(analysis.created_at)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{analysis.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            judgmentInfo.color
                          } mr-2 ${judgmentInfo.level === 'PROCESSING' ? 'animate-pulse' : ''}`}
                        ></span>
                        <span className="text-sm font-medium">
                          {judgmentInfo.level === "PROCESSING" ? "PROCESSING..." : judgmentInfo.level}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/results/${analysis.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't saved any analyses yet.</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Analyse New Content
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
