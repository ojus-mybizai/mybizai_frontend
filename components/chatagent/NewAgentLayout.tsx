'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, User, Upload, MessageSquare, Brain, TestTube, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface NewChatAgentLayoutProps {
  children: React.ReactNode
}

interface NavigationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  isOptional?: boolean
}

const NAVIGATION_STEPS: NavigationStep[] = [
  {
    id: 'profile',
    title: 'Agent Profile',
    description: 'Basic information and behavior setup',
    icon: <User className="w-5 h-5 text-white" />,
    path: '/chatagent/new/profile'
  },
  {
    id: 'knowledgebase',
    title: 'Knowledge Base',
    description: 'Upload knowledge base and training data',
    icon: <Upload className="w-5 h-5 text-white" />,
    path: '/chatagent/new/knowledgebase',
    isOptional: true
  },
  {
    id: 'channels',
    title: 'Channel Integration',
    description: 'Connect communication channels',
    icon: <MessageSquare className="w-5 h-5 text-white" />,
    path: '/chatagent/new/channels'
  },
  {
    id: 'tools',
    title: 'Tools Setup',
    description: 'Configure capabilities and integrations',
    icon: <Brain className="w-5 h-5 text-white" />,
    path: '/chatagent/new/tools'
  },
  {
    id: 'test',
    title: 'Test & Deploy',
    description: 'Test your agent and deploy',
    icon: <TestTube className="w-5 h-5 text-white" />,
    path: '/chatagent/new/test'
  }
]

export default function NewChatAgentLayout({ children }: NewChatAgentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [agentId, setAgentId] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const agentIdParam = urlParams.get('agentId')
    if (agentIdParam) {
      setAgentId(agentIdParam)
    }

    // Determine current step based on pathname
    const currentPath = pathname.split('/').pop() || 'profile'
    const stepIndex = NAVIGATION_STEPS.findIndex(step => step.id === currentPath)
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex)
    }
  }, [pathname])

  const handleNext = () => {
    if (currentStep < NAVIGATION_STEPS.length - 1) {
      const nextStep = NAVIGATION_STEPS[currentStep + 1]
      const nextPath = agentId ? `${nextStep.path}?agentId=${agentId}` : nextStep.path
      router.push(nextPath)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = NAVIGATION_STEPS[currentStep - 1]
      const prevPath = agentId ? `${prevStep.path}?agentId=${agentId}` : prevStep.path
      router.push(prevPath)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      const step = NAVIGATION_STEPS[stepIndex]
      const stepPath = agentId ? `${step.path}?agentId=${agentId}` : step.path
      router.push(stepPath)
    }
  }

  const markStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]))
  }

  const canGoNext = currentStep < NAVIGATION_STEPS.length - 1
  const canGoPrevious = currentStep > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Chat Agent
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {NAVIGATION_STEPS.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Steps */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Setup Progress
              </h2>

              <nav className="space-y-4">
                {NAVIGATION_STEPS.map((step, index) => {
                  const isActive = index === currentStep
                  const isCompleted = completedSteps.has(index) || index < currentStep
                  const isAccessible = index <= currentStep || completedSteps.has(index)

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      disabled={!isAccessible}
                      className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : isAccessible
                          ? 'hover:bg-gray-50 dark:hover:bg-slate-800'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Step Icon/Number */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : isActive
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium ${
                            isActive
                              ? 'text-blue-900 dark:text-blue-100'
                              : isAccessible
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.title}
                          </p>
                          {step.isOptional && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              (Optional)
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          isActive
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              {/* Step Content */}
              <div className="p-6">
                {children}
              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentStep + 1} of {NAVIGATION_STEPS.length}
                  </span>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="flex items-center space-x-2"
                >
                  <span>{currentStep === NAVIGATION_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
