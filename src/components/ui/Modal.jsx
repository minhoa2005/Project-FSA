'use client'

import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  )
}