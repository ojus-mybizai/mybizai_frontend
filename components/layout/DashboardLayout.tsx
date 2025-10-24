'use client'

import { ReactNode } from 'react'
import BaseLayout from './BaseLayout'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <BaseLayout>
      <div className="flex-1 overflow-y-auto ">
        {children}
      </div>
    </BaseLayout>
  )
}
