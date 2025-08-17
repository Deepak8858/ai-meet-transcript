'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Undo2, Redo2, Save, Copy, Download, Share2, Eye, EyeOff, Clock, Search, Replace } from 'lucide-react'

interface Version {
  id: string
  content: string
  timestamp: Date
  type: 'auto' | 'manual' | 'ai'
  description?: string
}

interface AdvancedEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onShare: (content: string) => void
  onDownload: (content: string, format: string) => void
  enableAI: boolean
  enableCollaboration: boolean
}

export default function AdvancedEditor({
  initialContent,
  onSave,
  onShare,
  onDownload,
  enableAI = true,
  enableCollaboration = false
}: AdvancedEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [previewMode, setPreviewMode] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize with first version
  useEffect(() => {
    if (initialContent && versions.length === 0) {
      const initialVersion: Version = {
        id: 'initial',
        content: initialContent,
        timestamp: new Date(),
        type: 'manual',
        description: 'Initial content'
      }
      setVersions([initialVersion])
      setCurrentVersionIndex(0)
      updateCounts(initialContent)
    }
  }, [initialContent])

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (content !== versions[currentVersionIndex]?.content) {
        handleAutoSave()
      }
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content])

  const updateCounts = (text: string) => {
    setWordCount(text.trim().split(/\s+/).filter(word => word.length > 0).length)
    setCharCount(text.length)
  }

  const addVersion = (newContent: string, type: 'auto' | 'manual' | 'ai', description?: string) => {
    const newVersion: Version = {
      id: Date.now().toString(),
      content: newContent,
      timestamp: new Date(),
      type,
      description
    }
    
    const newVersions = [...versions.slice(0, currentVersionIndex + 1), newVersion]
    setVersions(newVersions)
    setCurrentVersionIndex(newVersions.length - 1)
    updateCounts(newContent)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    updateCounts(newContent)
  }

  const handleAutoSave = () => {
    setIsAutoSaving(true)
    addVersion(content, 'auto', 'Auto-saved')
    setLastSaved(new Date())
    setTimeout(() => setIsAutoSaving(false), 1000)
  }

  const handleManualSave = () => {
    addVersion(content, 'manual', 'Manually saved')
    onSave(content)
    setLastSaved(new Date())
  }

  const undo = () => {
    if (currentVersionIndex > 0) {
      const newIndex = currentVersionIndex - 1
      setCurrentVersionIndex(newIndex)
      setContent(versions[newIndex].content)
      updateCounts(versions[newIndex].content)
    }
  }

  const redo = () => {
    if (currentVersionIndex < versions.length - 1) {
      const newIndex = currentVersionIndex + 1
      setCurrentVersionIndex(newIndex)
      setContent(versions[newIndex].content)
      updateCounts(versions[newIndex].content)
    }
  }

  const restoreVersion = (versionIndex: number) => {
    setCurrentVersionIndex(versionIndex)
    setContent(versions[versionIndex].content)
    updateCounts(versions[versionIndex].content)
  }

  const searchAndReplace = () => {
    if (!searchTerm) return
    
    const newContent = content.replace(
      new RegExp(searchTerm, 'gi'),
      replaceTerm
    )
    
    setContent(newContent)
    addVersion(newContent, 'manual', `Replaced "${searchTerm}" with "${replaceTerm}"`)
  }

  const formatContent = (text: string) => {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
  }

  const canUndo = currentVersionIndex > 0
  const canRedo = currentVersionIndex < versions.length - 1

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Toolbar */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded ${canUndo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded ${canRedo ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded hover:bg-gray-100"
              title="Find & Replace"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="p-2 rounded hover:bg-gray-100"
              title={previewMode ? 'Edit mode' : 'Preview mode'}
            >
              {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={handleManualSave}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={() => onShare(content)}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <select
              onChange={(e) => onDownload(content, e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              defaultValue=""
            >
              <option value="" disabled>Export as...</option>
              <option value="txt">Text File</option>
              <option value="md">Markdown</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        {showSearch && (
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Find..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={searchAndReplace}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Replace All
            </button>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Words: {wordCount}</span>
            <span>Characters: {charCount}</span>
            <span>Versions: {versions.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isAutoSaving && <span className="text-blue-600">Saving...</span>}
            {lastSaved && (
              <span className="text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Editor Area */}
        <div className="flex-1">
          {previewMode ? (
            <div className="p-4 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-96 p-4 border-0 resize-none focus:outline-none font-mono text-sm"
              placeholder="Start typing your content..."
            />
          )}
        </div>

        {/* Version History Sidebar */}
        <div className="w-64 border-l border-gray-200 bg-gray-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-sm flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Version History
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                  index === currentVersionIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => restoreVersion(index)}
              >
                <div className="text-xs text-gray-600">
                  {version.timestamp.toLocaleTimeString()}
                </div>
                <div className="text-sm font-medium">
                  {version.type === 'auto' ? 'Auto-saved' : 
                   version.type === 'ai' ? 'AI-generated' : 'Manual save'}
                </div>
                {version.description && (
                  <div className="text-xs text-gray-500 truncate">
                    {version.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}