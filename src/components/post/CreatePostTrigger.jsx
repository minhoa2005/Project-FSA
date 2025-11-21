// src/components/post/CreatePostTrigger.jsx
'use client'

import { useState } from 'react'
import CreatePostModal from './CreatePostModal'
import { Avatar } from '@/components/ui/avatar'

export default function CreatePostTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition"
      >
        <Avatar className="w-10 h-10">
          <img src="/avatar.jpg" alt="avatar" />
        </Avatar>
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-500">
          Bạn đang nghĩ gì thế?
        </div>
      </div>

      <CreatePostModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}