'use client'

import { FileText, Upload, X } from 'lucide-react'

interface FileUploadProps {
  file: File | null
  fileContent: string
  onDrop: (files: File[]) => void
  getRootProps: any
  getInputProps: any
  isDragActive: boolean
  onRemoveFile: () => void
}

export default function FileUpload({
  file,
  fileContent,
  onDrop,
  getRootProps,
  getInputProps,
  isDragActive,
  onRemoveFile,
}: FileUploadProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Upload Meeting Transcript</h2>
      
      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors min-h-0
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-4" />
          <div className="text-gray-600">
            <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
              {isDragActive ? 'Drop your file here...' : 'Drag & drop your transcript file'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Supports .txt, .md, .json, .pdf files up to 10MB
            </p>
            <button
              type="button"
              className="mt-2 sm:mt-4 px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Browse Files
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
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
              onClick={onRemoveFile}
              className="p-1 sm:p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
              title="Remove file"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          
          {fileContent && (
            <div className="mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Preview:</p>
              <div className="bg-white border rounded p-2 sm:p-3 max-h-32 overflow-y-auto">
                <p className="text-xs sm:text-sm text-gray-800 line-clamp-3 break-words">
                  {fileContent.substring(0, 200)}...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}