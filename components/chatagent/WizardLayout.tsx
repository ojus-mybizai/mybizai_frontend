'use client'

import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface WizardStep {
  id: string
  title: string
  description: string
  icon: ReactNode
  isCompleted?: boolean
  isOptional?: boolean
}

interface WizardLayoutProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onNext: () => void
  onPrevious: () => void
  onSaveDraft?: () => void
  onPublish?: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  isLastStep: boolean
  isLoading?: boolean
  children: ReactNode
  previewContent?: ReactNode
}

export default function WizardLayout({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onSaveDraft,
  onPublish,
  canGoNext,
  canGoPrevious,
  isLastStep,
  isLoading = false,
  children,
  previewContent
}: WizardLayoutProps) {
  const currentStepData = steps[currentStep]

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
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {onSaveDraft && (
                <Button
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Save Draft
                </Button>
              )}
              
              {isLastStep && onPublish && (
                <Button
                  onClick={onPublish}
                  disabled={!canGoNext || isLoading}
                  className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? 'Publishing...' : 'Publish Agent'}
                </Button>
              )}
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
                {steps.map((step, index) => {
                  const isActive = index === currentStep
                  const isCompleted = step.isCompleted || index < currentStep
                  const isAccessible = index <= currentStep
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => isAccessible && onStepChange(index)}
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
          <div className={`col-span-12 ${previewContent ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
              {/* Step Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentStepData.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                {children}
              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  disabled={!canGoPrevious || isLoading}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentStep + 1} of {steps.length}
                  </span>
                </div>

                <Button
                  onClick={onNext}
                  disabled={!canGoNext || isLoading}
                  className="flex items-center space-x-2"
                >
                  <span>{isLastStep ? 'Review' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Panel - Removed */}
          {previewContent && (
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    See how your agent will appear
                  </p>
                </div>
                <div className="p-6">
                  {previewContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
