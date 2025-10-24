'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, X, ChevronLeft, ChevronRight, TrendingUp, Users, Target, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useLeadStore } from '@/lib/stores'
import { crmApi } from '@/lib/api'
import { Lead, LeadStatus, LeadSource, LeadPriority } from '@/lib/api'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const sourceOptions = [
  { value: '', label: 'All Sources' },
  { value: 'portal', label: 'Portal' },
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'ad_campaign', label: 'Ad Campaign' },
]


const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'won': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getPriorityColor = (priority: LeadPriority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export default function LeadsPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const {
    leads,
    pagination,
    isLoading,
    setLeads,
    setPagination,
    setLoading,
    removeLead
  } = useLeadStore()

  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [filters, setFilters] = useState<{
    search: string
    status: LeadStatus | ''
    source: LeadSource | ''
  }>({
    search: '',
    status: '',
    source: ''
  })
  const [stats, setStats] = useState<{
    total: number
    by_status: Record<string, number>
    conversion_rate: number
  } | null>(null)

  useEffect(() => {
    fetchLeads()
    fetchStats()
  }, [accessToken, filters, pagination.page, pagination.per_page])

  const fetchLeads = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        search: filters.search || undefined,
        status: filters.status || undefined,
        source: filters.source || undefined,
      }
      const response = await crmApi.getLeads(accessToken, params)
      const totalPages = Math.ceil(response.total / response.per_page)
      setLeads(response.leads, {
        total: response.total,
        page: response.page,
        per_page: response.per_page,
        total_pages: totalPages
      })
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!accessToken) return

    try {
      const statsData = await crmApi.getLeadStats(accessToken)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch lead stats:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!accessToken) return

    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
      return
    }

    try {
      await crmApi.deleteLead(id, accessToken)
      removeLead(id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete lead:', error)
      if (error instanceof Error) {
        alert(`Failed to delete lead: ${error.message}`)
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination({
      page: newPage,
      per_page: pagination.per_page,
      total: pagination.total,
      total_pages: pagination.total_pages
    })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      source: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status || filters.source

  return (
    <div className="space-y-6">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sales pipeline</p>
          </div>
        </div>
        <Button onClick={() => router.push('/leads/new')} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contacted</p>
                  <p className="text-2xl font-bold">{stats.by_status.contacted || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Won</p>
                  <p className="text-2xl font-bold">{stats.by_status.won || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-2xl font-bold">{stats.conversion_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search leads by name, phone, or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white rounded-full w-2 h-2"></span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                options={statusOptions}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as LeadStatus | '' })}
                placeholder="All Statuses"
              />
              <Select
                options={sourceOptions}
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value as LeadSource | '' })}
                placeholder="All Sources"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading leads...</div>
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No leads found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? "No leads match your current filters. Try adjusting your search criteria."
                : "Get started by adding your first lead."
              }
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => router.push('/leads/new')}>
                Add Your First Lead
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {lead.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                            {lead.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Phone:</span> {lead.phone}
                          </div>
                          {lead.email && (
                            <div>
                              <span className="font-medium">Email:</span> {lead.email}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Source:</span> {lead.source.replace('_', ' ')}
                          </div>
                          
                          {/* Display extra_data fields */}
                          {lead.extra_data && Object.entries(lead.extra_data).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>{' '}
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </div>
                          ))}
                        </div>
                        
                        {lead.notes && (
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/leads/${lead.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(lead.id)}
                      className={deleteConfirm === lead.id ? 'bg-red-50 text-red-600 border-red-200' : ''}
                    >
                      {deleteConfirm === lead.id ? 'Confirm Delete' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && leads.length > 0 && (pagination.total_pages || 0) > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} leads
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm">
                  Page {pagination.page} of {pagination.total_pages || 1}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= (pagination.total_pages || 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
