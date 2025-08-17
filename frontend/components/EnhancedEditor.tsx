import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, Download, History, FileText, Save, RotateCcw, RotateCw, Search, Copy, Share2, Eye, EyeOff, Sparkles } from 'lucide-react';

interface Version {
  id: string;
  content: string;
  timestamp: string;
  userId: string;
  action: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    lineCount: number;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

interface EnhancedEditorProps {
  initialContent: string;
  documentId: string;
  onContentChange: (content: string) => void;
  onSave?: (content: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EnhancedEditor({ initialContent, documentId, onContentChange, onSave }: EnhancedEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [versions, setVersions] = useState<Version[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (content !== initialContent && !isSaving) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [content, initialContent, isSaving]);

  // Update counts
  useEffect(() => {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(content.length);
  }, [content]);

  // Load versions and templates
  useEffect(() => {
    loadVersions();
    loadTemplates();
  }, [documentId]);

  const loadVersions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/version-history/documents/${documentId}/versions`);
      setVersions(response.data.versions);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/templates/templates`);
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleContentChange = (newContent: string) => {
    // Add to undo stack
    setUndoStack(prev => [...prev, content]);
    setRedoStack([]); // Clear redo stack on new change
    
    setContent(newContent);
    onContentChange(newContent);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastContent = undoStack[undoStack.length - 1];
      setRedoStack(prev => [content, ...prev]);
      setUndoStack(prev => prev.slice(0, -1));
      setContent(lastContent);
      onContentChange(lastContent);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[0];
      setUndoStack(prev => [...prev, content]);
      setRedoStack(prev => prev.slice(1));
      setContent(nextContent);
      onContentChange(nextContent);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/api/version-history/documents/${documentId}/versions`, {
        content,
        userId: 'current-user',
        action: 'manual-save',
        metadata: {
          source: 'enhanced-editor'
        }
      });
      
      setLastSaved(new Date());
      onSave?.(content);
      
      // Reload versions
      loadVersions();
    } catch (error) {
      console.error('Error saving version:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    try {
      await axios.post(`${API_URL}/api/version-history/documents/${documentId}/versions`, {
        content,
        userId: 'current-user',
        action: 'auto-save',
        metadata: {
          source: 'enhanced-editor'
        }
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error auto-saving version:', error);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/version-history/documents/${documentId}/versions/${versionId}/restore`, {
        userId: 'current-user'
      });
      
      setContent(response.data.version.content);
      onContentChange(response.data.version.content);
      setShowHistory(false);
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  const handleApplyTemplate = (template: Template) => {
    setContent(template.content);
    onContentChange(template.content);
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleExport = async (format: string, options = {}) => {
    try {
      const response = await axios.post(`${API_URL}/api/export/export`, {
        content,
        format,
        options
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());

    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + searchTerm.length);
    }
  };

  const handleReplace = () => {
    if (!searchTerm || !replaceTerm || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    const newText = text.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
    
    handleContentChange(newText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleSearchAndReplace = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    
    if (searchTerm && replaceTerm) {
      const newText = text.replace(new RegExp(searchTerm, 'gi'), replaceTerm);
      handleContentChange(newText);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-lg shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0 flex-wrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300" />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded hover:bg-gray-100"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 rounded hover:bg-gray-100"
            title="Templates"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 rounded hover:bg-gray-100"
            title="Preview"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <select
            onChange={(e) => handleExport(e.target.value)}
            className="px-3 py-1 text-sm border rounded"
            defaultValue=""
          >
            <option value="" disabled>Export as...</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="markdown">Markdown</option>
            <option value="txt">Text</option>
          </select>
          <button
            onClick={handleCopy}
            className="p-2 rounded hover:bg-gray-100"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Replace */}
      <div className="flex items-center space-x-2 p-4 border-b bg-gray-50 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1 text-sm border rounded"
        />
        <input
          type="text"
          placeholder="Replace with..."
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          className="px-3 py-1 text-sm border rounded"
        />
        <button
          onClick={handleSearch}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Find
        </button>
        <button
          onClick={handleReplace}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
        >
          Replace
        </button>
        <button
          onClick={handleSearchAndReplace}
          className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Replace All
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Templates Panel */}
        {showTemplates && (
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto flex-shrink-0">
            <h3 className="font-semibold mb-3">Templates</h3>
            <div className="space-y-2">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="p-3 bg-white rounded shadow-sm cursor-pointer hover:shadow-md"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-gray-600">{template.description}</p>
                  <div className="mt-1">
                    {template.tags.map(tag => (
                      <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto flex-shrink-0">
            <h3 className="font-semibold mb-3">Version History</h3>
            <div className="space-y-2">
              {versions.map(version => (
                <div
                  key={version.id}
                  className="p-3 bg-white rounded shadow-sm cursor-pointer hover:shadow-md"
                  onClick={() => handleRestoreVersion(version.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{version.action}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(version.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{version.metadata.wordCount} words</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 p-4 min-h-0">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-0"
              placeholder="Start typing or select a template..."
              style={{ minHeight: '200px' }}
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="w-1/2 p-4 border-l bg-gray-50 min-h-0 overflow-auto">
              <h3 className="font-semibold mb-3">Preview</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{content}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}