import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AgentsExplanation() {
  const agents = [
    {
      name: "Linguistic Feature Analysis Agent",
      description:
        "Analyzes the linguistic properties of content, examining emotional tone, writing style, and other features that might indicate misinformation.",
    },
    {
      name: "Fact-Checking Agent",
      description:
        "Verifies the factual accuracy of claims by retrieving evidence from search engines and trusted knowledge bases.",
    },
    {
      name: "Sentiment Analysis Agent",
      description: "Detects emotional manipulation by analyzing the sentiment and emotional triggers in the content.",
    },
    {
      name: "Judge Agent",
      description: "Makes the final authenticity judgment based on the combined analysis from all other agents.",
    },
  ]

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-4">Our AI Agents</h2>
      <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
        TrustIt AI uses a multi-agent system to analyze content from different perspectives, providing a comprehensive
        assessment of potential misinformation.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
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
