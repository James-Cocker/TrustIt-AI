import ClientWrapper from '@/components/results/client-wrapper'

export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analysis Results</h1>
        <ClientWrapper id={params.id} />
      </div>
    </div>
  )
}
