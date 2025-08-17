'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface PromptInputProps {
  prompt: string
  setPrompt: (prompt: string) => void
  promptTemplates: Array<{ label: string; value: string }>
  onSummarize: () => void
  isLoading: boolean
  disabled: boolean
}

export default function PromptInput({
  prompt,
  setPrompt,
  promptTemplates,
  onSummarize,
  isLoading,
  disabled,
}: PromptInputProps) {
  const [showTemplates, setShowTemplates] = useState(false)

  const handleTemplateSelect = (templateValue: string) => {
    setPrompt(templateValue)
    setShowTemplates(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Summarization Instructions</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your custom instructions for the AI..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={disabled || isLoading}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            disabled={disabled || isLoading}
          >
            <span>Use a Template</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
          
          {showTemplates && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {promptTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template.value)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{template.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{template.value.substring(0, 80)}...</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onSummarize}
          disabled={disabled || isLoading || !prompt.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating Summary...' : 'Generate Summary'}
        </button>
      </div>
    </div>
  )
}