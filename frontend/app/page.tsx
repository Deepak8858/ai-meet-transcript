'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import FileUpload from '@/components/FileUpload'
import PdfUpload from '@/components/PdfUpload'
import PromptInput from '@/components/PromptInput'
import SummaryDisplay from '@/components/SummaryDisplay'
import EmailShare from '@/components/EmailShare'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Sun, Moon } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSharing, setIsSharing] = useState<boolean>(false)
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false)
  const [uploadMode, setUploadMode] = useState<'text' | 'pdf'>('text')
  // Theme state and initialization (inside component)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) return stored
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (theme === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      
      if (uploadedFile.type === 'application/pdf') {
        // Handle PDF files - extract text via API
        handlePdfUpload(uploadedFile)
      } else {
        // Handle text-based files
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setFileContent(content)
          toast.success('File uploaded successfully!')
        }
        reader.readAsText(uploadedFile)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      ...(uploadMode === 'text' ? {} : { 'application/pdf': ['.pdf'] }),
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handlePdfUpload = async (pdfFile: File) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      
      const response = await axios.post(`${API_URL}/api/pdf/extract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      if (response.data.success) {
        setFileContent(response.data.data.text)
        toast.success('PDF processed successfully!')
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

  const handleSummarize = async () => {
    if (!fileContent) {
      toast.error('Please upload a file first')
      return
    }
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for summarization')
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/summarize`, {
        content: fileContent,
        prompt: prompt,
      })
      setSummary(response.data.summary)
      toast.success('Summary generated successfully!')
    } catch (error: any) {
      console.error('Error summarizing:', error)
      toast.error(error.response?.data?.error || 'Failed to generate summary')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareEmail = async (recipients: string[], subject: string) => {
    if (!summary.trim()) {
      toast.error('No summary to share')
      return
    }

    setIsSharing(true)
    try {
      await axios.post(`${API_URL}/api/share`, {
        recipients,
        subject,
        summary,
        originalFileName: file?.name || 'Meeting Notes',
      })
      toast.success('Email sent successfully!')
      setShowEmailForm(false)
    } catch (error: any) {
      console.error('Error sending email:', error)
      toast.error(error.response?.data?.error || 'Failed to send email')
    } finally {
      setIsSharing(false)
    }
  }

  const handleDownload = () => {
    if (!summary.trim()) {
      toast.error('No summary to download')
      return
    }

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-summary-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Summary downloaded!')
  }

  const promptTemplates = [
    { label: 'Executive Summary', value: 'Create a concise executive summary in bullet points highlighting key decisions and outcomes.' },
    { label: 'Action Items', value: 'Extract all action items, decisions, and next steps with assigned owners and deadlines.' },
    { label: 'Meeting Minutes', value: 'Create detailed meeting minutes with clear sections for attendees, agenda items, decisions, and action items.' },
    { label: 'Key Insights', value: 'Identify and summarize the key insights, challenges discussed, and strategic decisions made.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-800 transition-colors duration-300">
      {/* Top bar with theme toggle */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/60 dark:bg-dark-900/50 border-b border-gray-200/60 dark:border-dark-700/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Theme Toggle - top-left */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="group relative inline-flex items-center h-8 w-14 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 bg-gray-200 dark:bg-dark-700 hover:shadow-glow"
            >
              <span
                className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white dark:bg-dark-600 shadow transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
              />
              <span className="absolute left-2 text-gray-500 group-hover:text-gray-700 transition-colors">
                <Sun className={`h-4 w-4 ${theme === 'dark' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} transition-all duration-300`} />
              </span>
              <span className="absolute right-2 text-gray-400 group-hover:text-gray-200 transition-colors">
                <Moon className={`h-4 w-4 ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} transition-all duration-300`} />
              </span>
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-300 select-none">{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-700">SaaS UI</span>
            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-700">Interactive</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Meeting Notes Summarizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload your meeting transcript and get professional AI-generated summaries
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Prompt */}
          <div className="space-y-6">
            <div className="mb-4">
              <div className="flex space-x-1 bg-gray-100 dark:bg-dark-700 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setUploadMode('text')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    uploadMode === 'text'
                      ? 'bg-white dark:bg-dark-800 text-blue-600 shadow ring-1 ring-gray-200 dark:ring-dark-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Text Files
                </button>
                <button
                  onClick={() => setUploadMode('pdf')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    uploadMode === 'pdf'
                      ? 'bg-white dark:bg-dark-800 text-blue-600 shadow ring-1 ring-gray-200 dark:ring-dark-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  PDF to Transcript
                </button>
              </div>
            </div>

            {uploadMode === 'text' ? (
              <FileUpload
                file={file}
                fileContent={fileContent}
                onDrop={onDrop}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                onRemoveFile={() => {
                  setFile(null)
                  setFileContent('')
                  setSummary('')
                }}
              />
            ) : (
              <PdfUpload
                onPdfProcessed={(text, metadata) => {
                  setFileContent(text)
                  // Create a mock file object for consistency
                  setFile(new File([text], 'pdf-transcript.txt', { type: 'text/plain' }))
                }}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}

            <PromptInput
              prompt={prompt}
              setPrompt={setPrompt}
              promptTemplates={promptTemplates}
              onSummarize={handleSummarize}
              isLoading={isLoading}
              disabled={!fileContent}
            />
          </div>

          {/* Right Column - Summary Display */}
          <div className="space-y-4 sm:space-y-6 min-h-0">
            <SummaryDisplay
              summary={summary}
              onEdit={setSummary}
              onDownload={handleDownload}
              onShare={() => setShowEmailForm(true)}
              isLoading={isLoading}
            />

            {showEmailForm && (
              <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-dark-800 rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto shadow-lg border border-gray-200 dark:border-dark-700">
                  <EmailShare
                    onShare={handleShareEmail}
                    onClose={() => setShowEmailForm(false)}
                    isSharing={isSharing}
                    summary={summary}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  )
}