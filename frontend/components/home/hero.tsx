"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function Hero() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <section className="py-20 text-center">
      <h1 className="text-5xl font-bold mb-6">
        Detect Misinformation with <span className="text-blue-600">AI</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        TrustIt AI uses advanced AI agents to analyze content and identify potential misinformation, helping you make
        informed decisions about what you read online.
      </p>
      <div className="flex justify-center gap-4">
        {!user ? (
          <Button size="lg" onClick={() => router.push("/signup")}>
            Get Started
          </Button>
        ) : (
          <Button size="lg" onClick={() => router.push("#analyzer")}>
            Analyse Content
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={() => router.push("#how-it-works")}>
          Learn More
        </Button>
      </div>
    </section>
  )
}
