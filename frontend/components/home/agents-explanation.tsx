import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AgentsExplanation() {
  const agents = [
    {
      name: "Question Generator Agent",
      description:
        "Analyzes content to identify factual claims and generates specific verification questions to determine the truthfulness of these claims.",
    },
    {
      name: "Fact-Checking Agent",
      description:
        "Searches for evidence across multiple reliable sources using Tavily API, evaluates the credibility of information, and provides verification status with confidence scores.",
    },
    {
      name: "Judge Agent",
      description: "Makes the final authenticity judgment (REAL, MISLEADING, or FAKE) based on the fact-check results, weighing evidence quality and confidence levels.",
    },
  ]

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-4">Our AI Agents</h2>
      <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
        TrustIt-AI uses a multi-agent system powered by Portia to decompose complex fact-checking tasks, providing a comprehensive
        assessment of potential misinformation.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{agent.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
