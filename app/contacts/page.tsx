'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Phone, Mail, Building, User, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useContactStore } from '@/lib/stores'
import { crmApi } from '@/lib/api'
// import { MockApiError } from '@/lib/mockData'
import { Contact } from '@/lib/api'

export default function ContactsPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const {
    contacts,
    filters,
    isLoading,
    setContacts,
    setFilters,
    clearFilters,
    setLoading,
    removeContact
  } = useContactStore()

  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchContacts()
  }, [accessToken, filters])

  const fetchContacts = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const params = {
        search: filters.search || undefined,
        phone: filters.phone || undefined,
        email: filters.email || undefined,
      }
      const contactList = await crmApi.getContacts(accessToken, params)
      setContacts(contactList)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
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
      await crmApi.deleteContact(id, accessToken)
      removeContact(id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete contact:', error)
    if (error instanceof Error) {
        alert(`Failed to delete contact: ${error.message}`)
      }
    }
  }

  const hasActiveFilters = filters.search || filters.phone || filters.email

  return (
    <div className="space-y-6">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customer directory</p>
          </div>
        </div>
        <Button onClick={() => router.push('/contacts/new')} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts by name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
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
              <Input
                placeholder="Filter by phone..."
                value={filters.phone}
                onChange={(e) => setFilters({ phone: e.target.value })}
              />
              <Input
                placeholder="Filter by email..."
                value={filters.email}
                onChange={(e) => setFilters({ email: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading contacts...</div>
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No contacts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasActiveFilters 
                ? "No contacts match your current filters. Try adjusting your search criteria."
                : "Get started by adding your first contact."
              }
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => router.push('/contacts/new')}>
                Add Your First Contact
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{contact.full_name}</CardTitle>
                      {contact.company && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Building className="w-3 h-3 mr-1" />
                          {contact.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {contact.notes}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contact.id)}
                    className={deleteConfirm === contact.id ? 'bg-red-50 text-red-600 border-red-200' : ''}
                  >
                    {deleteConfirm === contact.id ? 'Confirm Delete' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && contacts.length > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' matching your filters'}
        </div>
      )}
    </div>
  )
}
