"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
// Removed ImageUploader import

export default function ContentAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAnalyzeText = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty content",
        description: "Please enter some text to analyse",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Store the query in localStorage for the results page
      localStorage.setItem('lastQuery', text)
      
      // Clear any previous analysis results
      localStorage.removeItem('lastAnalysis')
      
      // Generate a simple ID based on timestamp
      const analysisId = Date.now().toString()
      
      // Navigate to results page immediately
      router.push(`/results/${analysisId}`)
    } catch (error) {
      toast({
        title: "Navigation failed",
        description: error instanceof Error ? error.message : "There was an error navigating to the results page. Please try again.",
        variant: "destructive",
      })
      setIsAnalyzing(false)
    }
  }

  return (
    <section id="analyzer">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Check for Misinformation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <FileText className="mr-2 h-4 w-4" />
            <span>Text Analysis</span>
          </div>
          <Textarea
            placeholder="Paste or type the text you want to analyse..."
            className="min-h-[200px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleAnalyzeText}
            disabled={isAnalyzing || !text.trim()}
            className="w-full"
          >
            {isAnalyzing ? "Redirecting..." : "Analyse"}
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
