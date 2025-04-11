import type { Metadata } from "next"
import Hero from "@/components/home/hero"
import ContentAnalyzer from "@/components/home/content-analyzer"
import HowItWorks from "@/components/home/how-it-works"
import AgentsExplanation from "@/components/home/agents-explanation"

export const metadata: Metadata = {
  title: "TrustIt AI - Detect Misinformation with AI",
  description: "Upload text or images to analyse for potential misinformation using our AI-powered agents",
}

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <Hero />
      <ContentAnalyzer />
      <HowItWorks />
      <AgentsExplanation />
    </div>
  )
}

