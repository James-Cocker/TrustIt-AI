export default function HowItWorks() {
  const steps = [
    {
      title: "Input Content",
      description: "Paste text or upload an image that you want to analyse for potential misinformation.",
    },
    {
      title: "AI Analysis",
      description:
        "Our specialised AI agents analyse the content from multiple perspectives, checking facts, sources, and emotional manipulation.",
    },
    {
      title: "Detailed Results",
      description:
        "Receive a comprehensive report showing why certain content may be misleading, with evidence and confidence scores.",
    },
    {
      title: "Make Informed Decisions",
      description: "Use our insights to better understand the reliability of the information you consume online.",
    },
  ]

  return (
    <section id="how-it-works" className="py-16">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center mb-4">
              {index + 1}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
