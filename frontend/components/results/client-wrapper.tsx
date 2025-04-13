"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Import the client component with dynamic import
const ClientResults = dynamic(() => import('./client-results'), {
  ssr: false,
  loading: () => <div className="py-12 text-center">Loading results...</div>
})

export default function ClientWrapper({ id }: { id: string }) {
  return (
    <Suspense fallback={<div className="py-12 text-center">Loading results...</div>}>
      <ClientResults id={id} />
    </Suspense>
  )
} 