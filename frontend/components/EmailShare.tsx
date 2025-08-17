'use client'

import { useState } from 'react'
import { X, Mail } from 'lucide-react'

interface EmailShareProps {
  onShare: (recipients: string[], subject: string) => void
  onClose: () => void
  isSharing: boolean
  summary: string
}

export default function EmailShare({ onShare, onClose, isSharing, summary }: EmailShareProps) {
  const [recipients, setRecipients] = useState<string>('')
  const [subject, setSubject] = useState<string>('Meeting Summary')
  const [errors, setErrors] = useState<{ recipients?: string; subject?: string }>({})

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleShare = () => {
    const newErrors: { recipients?: string; subject?: string } = {}

    if (!recipients.trim()) {
      newErrors.recipients = 'Please enter at least one recipient'
    } else {
      const emailList = recipients.split(',').map(email => email.trim()).filter(email => email)
      const invalidEmails = emailList.filter(email => !validateEmail(email))
      
      if (invalidEmails.length > 0) {
        newErrors.recipients = `Invalid email format: ${invalidEmails.join(', ')}`
      }
    }

    if (!subject.trim()) {
      newErrors.subject = 'Please enter a subject'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const emailList = recipients.split(',').map(email => email.trim()).filter(email => email)
    onShare(emailList, subject)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share via Email</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => {
                setRecipients(e.target.value)
                setErrors({ ...errors, recipients: undefined })
              }}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.recipients && (
              <p className="text-sm text-red-600 mt-1">{errors.recipients}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
                setErrors({ ...errors, subject: undefined })
              }}
              placeholder="Meeting Summary"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.subject && (
              <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary Preview
            </label>
            <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-600 line-clamp-4">
                {summary.substring(0, 200)}...
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{isSharing ? 'Sending...' : 'Send Email'}</span>
            </button>
            <button
              onClick={onClose}
              disabled={isSharing}
              className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}