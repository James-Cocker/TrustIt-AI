"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const { user, loading } = useAuth()

  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <Tabs defaultValue="recent">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent Analyses</TabsTrigger>
          <TabsTrigger value="saved">Saved Items</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sample Analysis</CardTitle>
                <CardDescription>Analyzed 2 hours ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Text analysis of news article about climate change...</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span className="text-sm font-medium">Medium risk</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/results/sample-id-1")}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twitter Post Analysis</CardTitle>
                <CardDescription>Analyzed yesterday</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Analysis of viral social media post about health claims...</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span className="text-sm font-medium">High risk</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/results/sample-id-2")}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="text-center py-12">
            <p className="text-gray-500">You haven't saved any analyses yet.</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Analyze New Content
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
