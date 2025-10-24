'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { BulkUploadResponse } from '@/lib/api'

interface BulkUploadFormProps {
  onUpload: (file: File, fieldMapping: Record<string, string>) => Promise<BulkUploadResponse>
  onCancel: () => void
  isLoading?: boolean
}

interface CSVPreview {
  headers: string[]
  rows: string[][]
}

export default function BulkUploadForm({ onUpload, onCancel, isLoading = false }: BulkUploadFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(null)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredFields = [
    { key: 'name', label: 'Item Name', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'price', label: 'Price', required: true },
    { key: 'currency', label: 'Currency', required: false },
    { key: 'availability', label: 'Availability', required: false },
    { key: 'type', label: 'Type', required: false }
  ]

  const steps = [
    { number: 1, title: 'Upload File', description: 'Select your CSV/Excel file' },
    { number: 2, title: 'Map Fields', description: 'Match CSV columns to catalog fields' },
    { number: 3, title: 'Preview', description: 'Review data before import' },
    { number: 4, title: 'Results', description: 'Import complete' }
  ]

  const parseCSV = (text: string): CSVPreview => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) throw new Error('File is empty')
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1, 6).map(line => // Preview first 5 rows
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    )
    
    return { headers, rows }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setSelectedFile(file)

    try {
      const text = await file.text()
      const preview = parseCSV(text)
      setCsvPreview(preview)
      
      // Auto-map obvious fields
      const autoMapping: Record<string, string> = {}
      preview.headers.forEach(header => {
        const lowerHeader = header.toLowerCase()
        const matchedField = requiredFields.find(field => 
          lowerHeader.includes(field.key) || 
          lowerHeader === field.label.toLowerCase()
        )
        if (matchedField) {
          autoMapping[matchedField.key] = header
        }
      })
      setFieldMapping(autoMapping)
      
      setCurrentStep(2)
    } catch (err) {
      setError('Failed to parse file. Please ensure it\'s a valid CSV file.')
    }
  }

  const handleFieldMappingChange = (fieldKey: string, csvHeader: string) => {
    setFieldMapping(prev => ({ ...prev, [fieldKey]: csvHeader }))
  }

  const validateMapping = (): boolean => {
    const requiredMappings = requiredFields.filter(f => f.required)
    return requiredMappings.every(field => fieldMapping[field.key])
  }

  const handlePreview = () => {
    if (!validateMapping()) {
      setError('Please map all required fields')
      return
    }
    setError('')
    setCurrentStep(3)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const result = await onUpload(selectedFile, fieldMapping)
      setUploadResult(result)
      setCurrentStep(4)
    } catch (err) {
      setError('Upload failed. Please try again.')
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setSelectedFile(null)
    setCsvPreview(null)
    setFieldMapping({})
    setUploadResult(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const headers = requiredFields.map(f => f.label).join(',')
    const sampleRow = 'Sample Product,A great product description,Electronics,99.99,USD,available,product'
    const csvContent = `${headers}\n${sampleRow}`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'catalog_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {step.number}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Upload your catalog file
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select a CSV file containing your catalog items
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Don't have a file ready? Download our template to get started.
                </p>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && csvPreview && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Map CSV columns to catalog fields
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <Select
                        options={[
                          { value: '', label: 'Select column...' },
                          ...csvPreview.headers.map(header => ({ value: header, label: header }))
                        ]}
                        value={fieldMapping[field.key] || ''}
                        onChange={(e) => handleFieldMappingChange(field.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  File Preview
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {csvPreview.headers.map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {csvPreview.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Showing first 5 rows of {selectedFile?.name}
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Review Import Settings
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">File:</span>
                    <span className="text-sm font-medium">{selectedFile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated rows:</span>
                    <span className="text-sm font-medium">{csvPreview?.rows.length || 0}+ items</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Field Mapping
                </h4>
                <div className="space-y-2">
                  {Object.entries(fieldMapping).map(([fieldKey, csvHeader]) => {
                    const field = requiredFields.find(f => f.key === fieldKey)
                    return (
                      <div key={fieldKey} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="text-sm font-medium">{field?.label}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">← {csvHeader}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && uploadResult && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center">
                {uploadResult.error_count === 0 ? (
                  <CheckCircle className="w-16 h-16 text-green-500" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-yellow-500" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Import Complete
                </h3>
                <div className="space-y-1">
                  <p className="text-green-600 dark:text-green-400">
                    ✓ {uploadResult.success_count} items imported successfully
                  </p>
                  {uploadResult.error_count > 0 && (
                    <p className="text-red-600 dark:text-red-400">
                      ✗ {uploadResult.error_count} items failed to import
                    </p>
                  )}
                </div>
              </div>
              
              {uploadResult.errors.length > 0 && (
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Import Errors:
                  </h4>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400">
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : currentStep === 4 ? handleReset : () => setCurrentStep(prev => prev - 1)}
        >
          {currentStep === 1 ? 'Cancel' : currentStep === 4 ? 'Upload Another File' : 'Previous'}
        </Button>
        
        {currentStep < 4 && (
          <Button
            onClick={currentStep === 2 ? handlePreview : currentStep === 3 ? handleUpload : () => {}}
            disabled={
              (currentStep === 1 && !selectedFile) ||
              (currentStep === 2 && !validateMapping()) ||
              isLoading
            }
            isLoading={isLoading && currentStep === 3}
          >
            {currentStep === 2 ? 'Preview' : currentStep === 3 ? 'Import' : 'Next'}
          </Button>
        )}
        
        {currentStep === 4 && (
          <Button onClick={onCancel}>
            Done
          </Button>
        )}
      </div>
    </div>
  )
}
