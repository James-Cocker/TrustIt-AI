"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import ImageUploader from "@/components/analyzers/image-uploader"

export default function ContentAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleAnalyzeText = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to analyze content",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!text.trim()) {
      toast({
        title: "Empty content",
        description: "Please enter some text to analyze",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // In a real implementation, this would call your backend API
      // const response = await fetch('/api/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: text, type: 'text' })
      // })
      // const result = await response.json()

      // Simulate API call with timeout
      // await new Promise((resolve) => setTimeout(resolve, 1500))

      // Navigate to results page with the analysis ID
      // router.push(`/results/sample-analysis-id`)
      const response = await fetch("https://your-fastapi-backend.com/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, type: "text" }),
      })

      if (!response.ok) {
        throw new Error("Analysis request failed")
      }

      const result = await response.json()
      router.push(`/results/${result.analysisId}`)
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <section id="analyzer" className="py-16">
      <h2 className="text-3xl font-bold text-center mb-8">Analyze Content</h2>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Check for Misinformation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text">
                <FileText className="mr-2 h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="image">
                <Upload className="mr-2 h-4 w-4" />
                Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <Textarea
                placeholder="Paste or type the text you want to analyze..."
                className="min-h-[200px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="image">
              <ImageUploader key={activeTab} />
            </TabsContent>
          </Tabs>
        </CardContent>

        {activeTab === "text" && (
          <CardFooter>
            <Button
              onClick={handleAnalyzeText}
              disabled={isAnalyzing || !text.trim()}
              className="w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </section>
  )
}
