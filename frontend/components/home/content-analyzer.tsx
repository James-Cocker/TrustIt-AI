"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { saveAnalysisResult } from "@/lib/supabase/database"
// Removed ImageUploader import

export default function ContentAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

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
      
      // If user is logged in, save to database (initial entry, result will be updated later)
      if (user) {
        try {
          // Create a placeholder result with processing status
          const placeholderResult = {
            status: "processing",
            overallScore: 50, // Neutral score while processing
          }
          
          // Save to database
          const dbAnalysisId = await saveAnalysisResult(
            user.id,
            text,
            placeholderResult
          )
          
          // Use the database ID if available
          if (dbAnalysisId) {
            // Navigate to results page with database ID
            router.push(`/results/${dbAnalysisId}`)
            return
          }
        } catch (error) {
          console.error("Error saving to database:", error)
          // Continue with localStorage approach as fallback
        }
      }
      
      // Navigate to results page immediately with timestamp ID
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
