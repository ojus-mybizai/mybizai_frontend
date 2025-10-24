'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewChatAgentRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new route-based structure
    router.replace('/chatagent/new/profile')
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
