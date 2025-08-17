'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { FileText, Upload, X, Settings, Users } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface PdfUploadProps {
  onPdfProcessed: (text: string, metadata?: any) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function PdfUpload({ onPdfProcessed, isLoading, setIsLoading }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [pdfMetadata, setPdfMetadata] = useState<any>(null)
  const [options, setOptions] = useState({
    includeMetadata: true,
    cleanText: true,
    includePageNumbers: true,
    speakerLabels: '',
  })
  const [showOptions, setShowOptions] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile)
      processPdf(uploadedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const processPdf = async (pdfFile: File) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('includeMetadata', options.includeMetadata.toString())
      formData.append('cleanText', options.cleanText.toString())
      formData.append('includePageNumbers', options.includePageNumbers.toString())
      
      if (options.speakerLabels.trim()) {
        const labels = options.speakerLabels.split(',').map(label => label.trim())
        formData.append('speakerLabels', JSON.stringify(labels))
      }

      const response = await axios.post(`${API_URL}/api/pdf/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setPdfMetadata(response.data.data.metadata)
        onPdfProcessed(response.data.data.transcript, response.data.data.metadata)
        toast.success('PDF converted to transcript successfully!')
      } else {
        toast.error(response.data.message || 'Failed to process PDF')
      }
    } catch (error: any) {
      console.error('Error processing PDF:', error)
      toast.error(error.response?.data?.error || 'Failed to process PDF')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPdfMetadata(null)
    setOptions({
      includeMetadata: true,
      cleanText: true,
      includePageNumbers: true,
      speakerLabels: '',
    })
  }

  const handleOptionChange = (key: string, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">PDF to Transcript Converter</h2>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-1 sm:p-2 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          title="Processing options"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors min-h-0
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
          <div className="text-gray-600">
            <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
              {isDragActive ? 'Drop your PDF here...' : 'Drag & drop your PDF file'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Supports PDF files up to 10MB
            </p>
            <button
              type="button"
              className="mt-2 sm:mt-4 px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
              disabled={isLoading}
            >
              Browse PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{file.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 sm:p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
              title="Remove file"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {pdfMetadata && (
            <div className="bg-white border rounded p-2 sm:p-3 mb-3 sm:mb-4">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Document Info</h4>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <p className="truncate"><strong>Title:</strong> {pdfMetadata.title}</p>
                <p className="truncate"><strong>Author:</strong> {pdfMetadata.author}</p>
                <p><strong>Pages:</strong> {pdfMetadata.pages}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {showOptions && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Processing Options</h3>
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                className="mr-2 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-gray-700">Include document metadata</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.cleanText}
                onChange={(e) => handleOptionChange('cleanText', e.target.checked)}
                className="mr-2 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-gray-700">Clean and format text</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includePageNumbers}
                onChange={(e) => handleOptionChange('includePageNumbers', e.target.checked)}
                className="mr-2 flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-gray-700">Include page references</span>
            </label>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Speaker Labels (comma-separated)
              </label>
              <input
                type="text"
                value={options.speakerLabels}
                onChange={(e) => handleOptionChange('speakerLabels', e.target.value)}
                placeholder="Alice, Bob, Charlie"
                className="w-full px-2 py-1 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}