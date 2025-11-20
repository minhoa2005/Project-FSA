// src/components/post/CreatePostModal.jsx
'use client'

import { useState } from 'react'
import { X, ImagePlus, Smile, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { createBlog } from '@/service/users/post'
import { toast } from 'sonner'

export default function CreatePostModal({ isOpen, onClose }) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  const handleFile = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(selected)
    selected.forEach(f => {
      const reader = new FileReader()
      reader.onload = () => setPreviews(p => [...p, reader.result])
      reader.readAsDataURL(f)
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('content', content)
    files.forEach(f => formData.append('media', f))

    setLoading(true)
    const result = await createBlog(formData)
    setLoading(false)

    if (result.success) {
      setContent('')
      setFiles([])
      setPreviews([])
      onClose()
    } else {
      toast.error("Đăng bài thất bại");
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Tạo bài viết</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={submit} className="p-4">
          <div className="flex gap-3 mb-4">
            <Avatar><img src="/avatar.jpg" /></Avatar>
            <div>
              <div className="font-semibold">Vương Giang Trường</div>
              <button type="button" className="text-sm bg-gray-100 px-3 py-1 rounded">Bạn bè ▼</button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Giang Trường ơi, bạn đang nghĩ gì thế?"
            className="w-full text-2xl outline-none resize-none min-h-32"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 my-4">
              {previews.map((src, i) => (
                <img key={i} src={src} className="rounded-lg max-h-64 object-cover" />
              ))}
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-t">
            <label className="cursor-pointer p-3 hover:bg-gray-100 rounded-lg">
              <ImagePlus className="w-8 h-8 text-green-500" />
              <input type="file" multiple accept="image/*,video/*" onChange={handleFile} className="hidden" />
            </label>
            <button type="button" className="p-3 hover:bg-gray-100 rounded-lg"><Smile className="w-8 h-8 text-yellow-500" /></button>
            <button type="button" className="p-3 hover:bg-gray-100 rounded-lg"><MapPin className="w-8 h-8 text-red-500" /></button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold">
            {loading ? 'Đang đăng...' : 'Đăng'}
          </Button>
        </form>
      </div>
    </div>
  )
}