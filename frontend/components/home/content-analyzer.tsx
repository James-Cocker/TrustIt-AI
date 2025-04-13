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
import Link from 'next/link'
import { API_BASE_URL } from "@/lib/api"

export default function ContentAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleAnalyzeText = async () => {
    // Temporarily comment out authentication check for testing
    /*if (!user) {
      return (
        <section id="analyzer" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Analyze Content</h2>
          <Card className="max-w-3xl mx-auto text-center py-8">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">Please sign in to analyze content for misinformation.</p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/signup">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )
    }*/
    
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
      console.log("Making API request to:", `${API_BASE_URL}/api/analyze`);
      
      // Make the API call to your Render backend
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, type: "text" }),
      })

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);
        throw new Error(`Analysis request failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("Received result:", result);
      
      // Store the result in localStorage for the results page to access
      localStorage.setItem('lastAnalysis', JSON.stringify({
        content: text,
        result: result.result,
        judgment: "COMPLETED",
        overallScore: 75 // Default score until your backend provides real scores
      }));
      
      console.log("Navigating to results page");
      // Always navigate to the static placeholder page instead of dynamic ID
      router.push('/results/placeholder');
    } catch (error) {
      console.error("API error details:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
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
                placeholder="Paste or type the text you want to analyse..."
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
              {isAnalyzing ? "Analysing..." : "Analyse"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </section>
  )
}
