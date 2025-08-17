'use client'

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Processing your request...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    </div>
  )
}