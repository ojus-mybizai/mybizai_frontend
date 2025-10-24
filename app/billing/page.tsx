'use client'

import { useState } from 'react'
import { Check, CreditCard, Zap, Crown, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started with AI chat agents',
    icon: Zap,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    features: [
      '1 Chat Agent',
      '100 conversations/month',
      '1 Knowledge Base entry',
      'Basic integrations',
      'Email support',
    ],
    limitations: [
      'Limited customization',
      'Basic analytics',
    ],
    current: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Ideal for small businesses scaling their customer support',
    icon: Crown,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: [
      '3 Chat Agents',
      '1,000 conversations/month',
      '10 Knowledge Base entries',
      'All integrations',
      'Priority email support',
      'Custom AI personalities',
      'Basic analytics dashboard',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    period: 'month',
    description: 'Advanced features for growing businesses',
    icon: Rocket,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: [
      '10 Chat Agents',
      '10,000 conversations/month',
      'Unlimited Knowledge Base',
      'All integrations + Custom APIs',
      'Phone & chat support',
      'Advanced AI customization',
      'Advanced analytics & reporting',
      'Multi-channel support',
      'Team collaboration',
    ],
  },
]

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('starter')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleUpgrade = (planId: string) => {
    // Mock upgrade functionality
    alert(`Upgrade to ${plans.find(p => p.id === planId)?.name} plan coming soon!`)
  }

  const getDiscountedPrice = (price: number) => {
    return billingCycle === 'yearly' ? Math.round(price * 0.8) : price
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Scale your AI chat agents and unlock advanced features to grow your business
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
              billingCycle === 'yearly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              20% off
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon
          const discountedPrice = getDiscountedPrice(plan.price)
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
              } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 ${plan.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${plan.color}`} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${plan.price === 0 ? '0' : discountedPrice}
                  </span>
                  {plan.price > 0 && (
                    <>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{billingCycle === 'yearly' ? 'year' : plan.period}
                      </span>
                      {billingCycle === 'yearly' && plan.price > 0 && (
                        <div className="text-sm text-gray-500 line-through">
                          ${plan.price}/{plan.period}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                          <span className="text-xs text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  {plan.current ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Can I change my plan at any time?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                What happens if I exceed my conversation limit?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your chat agents will continue to work, but you'll be charged overage fees. We'll notify you before you reach your limit.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Do you offer custom enterprise plans?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! Contact our sales team for custom pricing and features tailored to your enterprise needs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Support */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Need help choosing the right plan?
        </p>
        <Button variant="outline">
          <CreditCard className="w-4 h-4 mr-2" />
          Contact Sales
        </Button>
      </div>
    </div>
  )
}
