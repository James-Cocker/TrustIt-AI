"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function Hero() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <section className="pt-20 pb-10 text-center">
      <h1 className="text-5xl font-bold mb-6">
        Detect Misinformation with
        <span className="inline-flex items-center px-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-200% animate-gradient">
          AI
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" className="inline pb-2" viewBox="0 0 16 16"> 
            <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
          </svg>
        </span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        TrustIt AI uses advanced AI agents to analyse content and identify potential misinformation, helping you make
        informed decisions about what you read online.
      </p>
      {/* <div className="flex justify-center gap-4">
        {!user ? (
          <Button size="lg" onClick={() => router.push("/signup")}>
            Get Started
          </Button>
        ) : (
          <Button size="lg" onClick={() => router.push("#analyser")}>
            Analyse Content
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={() => router.push("#how-it-works")}>
          Learn More
        </Button>
      </div> */}
    </section>
  )
}
