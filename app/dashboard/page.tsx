'use client'

import { useEffect } from 'react'
import { Building2, Users, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useBusinessStore, useUserStore, useDashboardStore } from '@/lib/stores'

export default function DashboardPage() {
  const { businessData, activeBusiness } = useBusinessStore()
  const { user } = useUserStore()
  const { stats: dashboardStats } = useDashboardStore()

  // Use active business data if available, otherwise fallback to businessData
  const businessInfo = activeBusiness || businessData

  const stats = [
    {
      title: 'Conversations This Week',
      value: dashboardStats?.conversations_this_week?.toString() || '0',
      icon: Building2,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'New Leads',
      value: dashboardStats?.leads_this_week?.toString() || '0',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Orders Created',
      value: dashboardStats?.orders_created?.toString() || '0',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Chat Agents',
      value: dashboardStats?.active_chat_agents?.toString() || '0',
      icon: Calendar,
      gradient: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <>
      <div className="space-y-6">

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome to {businessInfo?.name || 'MyBizAI'}!
          </h1>
          <p className="text-blue-100">
            {user?.full_name ? `Hello ${user.full_name}, ` : user?.email ? `Hello ${user.email}, ` : ''}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Team Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Organize your team and assign roles to maximize productivity.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Coming soon: Advanced team collaboration features
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get AI-powered insights to grow your business faster.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Coming soon: Personalized business recommendations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversations */}
        {dashboardStats?.recent_conversations && dashboardStats.recent_conversations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.recent_conversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {conversation.customer_name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {conversation.customer_name}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          conversation.status === 'active' ? 'bg-green-100 text-green-800' :
                          conversation.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {conversation.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        via {conversation.agent_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                        {conversation.last_message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Info */}
        {businessInfo?.name && (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Business Name</h4>
                  <p className="text-gray-600 dark:text-gray-400">{businessInfo.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Address</h4>
                  <p className="text-gray-600 dark:text-gray-400">{businessInfo.address || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Phone</h4>
                  <p className="text-gray-600 dark:text-gray-400">{(businessInfo as any).phone_number || (businessInfo as any).phone || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Business Type</h4>
                  <p className="text-gray-600 dark:text-gray-400">{(businessInfo as any).business_type || (businessInfo as any).industry || 'Not set'}</p>
                </div>
                {businessInfo.description && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{businessInfo.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </>
  )
}
