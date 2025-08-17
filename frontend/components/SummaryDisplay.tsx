'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Download, Share2, Copy, Sparkles } from 'lucide-react'
import EnhancedEditor from './EnhancedEditor'

interface SummaryDisplayProps {
  summary: string
  sessionId: string
  onSummaryUpdate?: (summary: string) => void
  isLoading: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function SummaryDisplay({
  summary,
  sessionId,
  onSummaryUpdate,
  isLoading,
}: SummaryDisplayProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showEnhancedEditor, setShowEnhancedEditor] = useState(true)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      alert('Summary copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = async (format: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/export/export`, {
        content: summary,
        format,
        options: {
          title: 'Meeting Summary',
          includeMetadata: true
        }
      }, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `summary-${sessionId}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading:', error)
      alert('Failed to download file')
    }
  }

  const handleShare = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/share/create`, {
        content: summary,
        type: 'summary',
        title: 'Meeting Summary'
      })
      
      const shareUrl = `${window.location.origin}/share/${response.data.shareId}`
      setShareUrl(shareUrl)
      setIsSharing(true)
    } catch (error) {
      console.error('Error creating share:', error)
      alert('Failed to create share link')
    }
  }

  const handleSummaryUpdate = (newSummary: string) => {
    onSummaryUpdate?.(newSummary)
  }

  const wordCount = summary.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = summary.length

  return (
    <div className="bg-white rounded-lg shadow-lg w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Generated Summary</h2>
          <button
            onClick={() => setShowEnhancedEditor(!showEnhancedEditor)}
            className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs sm:text-sm flex-shrink-0"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">{showEnhancedEditor ? 'Simple' : 'Enhanced'} Editor</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs sm:text-sm flex-shrink-0"
            title="Copy summary"
          >
            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">Copy</span>
          </button>
          
          <select
            onChange={(e) => e.target.value && handleDownload(e.target.value)}
            className="px-2 py-1 sm:px-3 sm:py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs sm:text-sm flex-shrink-0"
            defaultValue=""
            title="Download summary"
          >
            <option value="" disabled>Download</option>
            <option value="txt">Text</option>
            <option value="md">Markdown</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
          </select>
          
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs sm:text-sm flex-shrink-0"
            title="Share summary"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">Share</span>
          </button>
        </div>
      </div>

      {isSharing && (
        <div className="p-4 sm:p-6 border-b bg-blue-50">
          <h3 className="font-semibold mb-2 text-sm sm:text-base">Share Link Created</h3>
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full px-3 py-2 border rounded bg-white text-sm"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
                alert('Link copied to clipboard!')
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-shrink-0"
            >
              Copy Link
            </button>
            <button
              onClick={() => setIsSharing(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm flex-shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Generating your summary...</p>
          </div>
        ) : !summary ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">Your summary will appear here</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 text-sm text-gray-600 gap-1">
              <span className="whitespace-nowrap">Word count: {wordCount}</span>
              <span className="whitespace-nowrap">Characters: {charCount}</span>
            </div>
            
            {showEnhancedEditor ? (
              <div className="min-h-0 flex-1">
                <EnhancedEditor
                  initialContent={summary}
                  documentId={sessionId}
                  onContentChange={handleSummaryUpdate}
                  onSave={handleSummaryUpdate}
                />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none min-h-0">
                <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto min-h-0">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 break-words">
                    {summary}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}