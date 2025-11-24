// src/components/post/CreatePost.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createBlogAction } from '@/service/users/postActions';
import { X } from 'lucide-react';  // Icon close

interface Props { 
  creatorId: number; 
  isOpen?: boolean; 
  onClose?: () => void; 
}

export default function CreatePost({ creatorId, isOpen = false, onClose }: Props) {
  const [state, formAction] = useFormState(createBlogAction, { success: false, error: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto border border-border shadow-xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-lg text-foreground">Tạo bài viết</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* Form */}
        <form action={formAction} className="p-4 space-y-4">
          <textarea
            name="text"
            placeholder="Bạn đang nghĩ gì?"
            className="w-full p-3 border border-border rounded resize-none h-32 focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <div className="flex space-x-2 text-sm text-muted-foreground">
            <button type="button" className="p-2 hover:bg-muted rounded">📷 Ảnh/video</button>
            <input type="file" name="image" accept="image/*" className="hidden" id="image-upload" />
            <input type="file" name="video" accept="video/*" className="hidden" id="video-upload" />
            <button type="button" className="p-2 hover:bg-muted rounded">😊 Cảm xúc</button>
          </div>
          <SubmitButton />
        </form>
        
        {/* Feedback */}
        {state.success && <p className="p-4 text-green-600 text-sm border-t border-border">Đăng thành công!</p>}
        {state.error && <p className="p-4 text-destructive text-sm border-t border-border">{state.error}</p>}
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium"
    >
      {pending ? 'Đang đăng...' : 'Đăng'}
    </button>
  );
}