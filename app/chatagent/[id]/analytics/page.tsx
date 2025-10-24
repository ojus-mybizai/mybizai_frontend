// 'use client'

// import { useParams } from 'next/navigation'
// import { BarChart3, MessageSquare, Clock, Users, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

// export default function AgentAnalyticsPage() {
//   const params = useParams()
//   const agentId = params.id

//   // Mock analytics data
//   const analyticsData = {
//     totalMessages: 1247,
//     avgResponseTime: 1.2,
//     leadsConverted: 23,
//     satisfactionScore: 4.6,
//     trends: {
//       messages: 12.5,
//       responseTime: -8.3,
//       conversions: 15.2,
//       satisfaction: 3.1
//     }
//   }

//   const StatCard = ({ 
//     title, 
//     value, 
//     unit, 
//     trend, 
//     icon: Icon,
//     color = "blue"
//   }: {
//     title: string
//     value: string | number
//     unit?: string
//     trend?: number
//     icon: any
//     color?: string
//   }) => {
//     const colorClasses = {
//       blue: "from-blue-500 to-blue-600",
//       green: "from-green-500 to-green-600", 
//       purple: "from-purple-500 to-purple-600",
//       orange: "from-orange-500 to-orange-600"
//     }

//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                 {title}
//               </p>
//               <div className="flex items-baseline space-x-1">
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {value}
//                 </p>
//                 {unit && (
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {unit}
//                   </p>
//                 )}
//               </div>
//               {trend !== undefined && (
//                 <div className={`flex items-center mt-1 ${
//                   trend > 0 
//                     ? 'text-green-600 dark:text-green-400' 
//                     : trend < 0 
//                     ? 'text-red-600 dark:text-red-400'
//                     : 'text-gray-500 dark:text-gray-400'
//                 }`}>
//                   {trend > 0 ? (
//                     <ArrowUp className="w-3 h-3 mr-1" />
//                   ) : trend < 0 ? (
//                     <ArrowDown className="w-3 h-3 mr-1" />
//                   ) : null}
//                   <span className="text-xs font-medium">
//                     {Math.abs(trend)}% from last month
//                   </span>
//                 </div>
//               )}
//             </div>
//             <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
//               <Icon className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 flex items-center justify-center shadow-lg">
//             <BarChart3 className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Analytics</h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">Performance insights and metrics</p>
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Total Messages"
//           value={analyticsData.totalMessages.toLocaleString()}
//           trend={analyticsData.trends.messages}
//           icon={MessageSquare}
//           color="blue"
//         />
//         <StatCard
//           title="Avg Response Time"
//           value={analyticsData.avgResponseTime}
//           unit="seconds"
//           trend={analyticsData.trends.responseTime}
//           icon={Clock}
//           color="green"
//         />
//         <StatCard
//           title="Leads Converted"
//           value={analyticsData.leadsConverted}
//           trend={analyticsData.trends.conversions}
//           icon={Users}
//           color="purple"
//         />
//         <StatCard
//           title="Satisfaction Score"
//           value={analyticsData.satisfactionScore}
//           unit="/ 5.0"
//           trend={analyticsData.trends.satisfaction}
//           icon={TrendingUp}
//           color="orange"
//         />
//       </div>

//       {/* Charts Placeholder */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Message Volume</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg">
//               <div className="text-center">
//                 <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500 dark:text-gray-400">
//                   Chart integration coming soon
//                 </p>
//                 <p className="text-sm text-gray-400 dark:text-gray-500">
//                   Message volume over time
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Response Time Trends</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg">
//               <div className="text-center">
//                 <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500 dark:text-gray-400">
//                   Chart integration coming soon
//                 </p>
//                 <p className="text-sm text-gray-400 dark:text-gray-500">
//                   Average response time trends
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Activity */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Activity</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {[
//               { time: '2 hours ago', event: 'Handled 15 new conversations', type: 'success' },
//               { time: '4 hours ago', event: 'Average response time improved by 0.3s', type: 'info' },
//               { time: '6 hours ago', event: 'Converted 2 leads to customers', type: 'success' },
//               { time: '8 hours ago', event: 'Escalated 1 conversation to human agent', type: 'warning' },
//               { time: '12 hours ago', event: 'Knowledge base updated with new FAQ', type: 'info' }
//             ].map((activity, index) => (
//               <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
//                 <div className={`w-2 h-2 rounded-full ${
//                   activity.type === 'success' 
//                     ? 'bg-green-500' 
//                     : activity.type === 'warning'
//                     ? 'bg-yellow-500'
//                     : 'bg-blue-500'
//                 }`} />
//                 <div className="flex-1">
//                   <p className="text-sm text-gray-900 dark:text-white">
//                     {activity.event}
//                   </p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">
//                     {activity.time}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Coming Soon Notice */}
//       <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
//         <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
//         <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
//           Advanced Analytics Coming Soon
//         </h3>
//         <p className="text-blue-800 dark:text-blue-200 mb-4">
//           We're working on detailed analytics including conversation flows, sentiment analysis, 
//           and performance insights to help you optimize your chat agents.
//         </p>
//         <div className="flex flex-wrap justify-center gap-2 text-sm text-blue-700 dark:text-blue-300">
//           <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//             Conversation Flow Analysis
//           </span>
//           <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//             Sentiment Tracking
//           </span>
//           <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//             A/B Testing
//           </span>
//           <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//             Custom Reports
//           </span>
//         </div>
//       </div>
//     </div>
//   )
// }


export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <p>comming soon...</p>
    </div>
  )
}
