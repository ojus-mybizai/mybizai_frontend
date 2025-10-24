'use client'

import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

interface BaseLayoutProps {
  children: ReactNode
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-scroll">
          {children}
        </main>
      </div>
    </div>
  )
}
