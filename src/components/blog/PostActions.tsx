// src/components/post/PostActions.tsx
'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { updateBlogAction, deleteBlogAction } from '@/service/users/postActions';  // Import từ actions (inline SQL)

interface Props {
  blogId: number;
  text: string;
  image?: string;
  creatorId: number;
  currentUserId: number;
}

export default function PostActions({ blogId, text, image, creatorId, currentUserId }: Props) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useFormState(
    (prevState: any, formData: FormData) => updateBlogAction(blogId, formData),
    { success: false, error: '' }
  );

  // Chỉ owner (creatorId === currentUserId) mới thấy nút sửa/xóa
  if (creatorId !== currentUserId) return null;

  const handleDelete = async () => {
    if (confirm('Bạn có chắc muốn xóa bài viết này? (Likes và bình luận sẽ bị xóa theo, không khôi phục được!)')) {
      const result = await deleteBlogAction(blogId);
      if (result.success) {
        // Feed tự refresh nhờ revalidatePath trong action
        setEditing(false);
      } else {
        alert(result.error || 'Lỗi xóa bài viết!');
      }
    }
  };

  return (
    <>
      {/* Nút Sửa/Xóa (giống FB, ở góc phải dưới post) */}
      <div className="flex justify-end space-x-2 mt-2 text-sm">
        <button 
          onClick={() => setEditing(true)} 
          className="text-primary hover:underline p-1 rounded transition-colors"
        >
          Sửa
        </button>
        <button 
          onClick={handleDelete} 
          className="text-destructive hover:underline p-1 rounded transition-colors"
        >
          Xóa
        </button>
      </div>

      {/* Modal Sửa Bài (giống FB edit modal, overlay full screen mobile) */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="p-6 rounded-lg max-w-md w-full bg-card border border-border shadow-xl">
            <h3 className="font-bold mb-4 text-lg text-foreground">Chỉnh sửa bài viết</h3>
            <form action={formAction} className="space-y-4">
              {/* Hidden input giữ image cũ nếu không thay */}
              <input type="hidden" name="existingImage" value={image || ''} />
              
              {/* Textarea nội dung */}
              <textarea 
                name="text" 
                defaultValue={text} 
                placeholder="Viết lại nội dung..."
                className="w-full p-3 border border-border rounded resize-none h-32 focus:outline-none focus:ring-2 focus:ring-ring" 
                required 
              />
              
              {/* Upload ảnh mới (thay thế cũ) */}
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-accent hover:file:text-accent-foreground" 
              />
              
              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditing(false)} 
                  className="px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={state.pending} 
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium"
                >
                  {state.pending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
            
            {/* Feedback */}
            {state.success && <p className="text-success mt-3 text-sm font-medium">Cập nhật thành công! Bài viết đã được chỉnh sửa.</p>}
            {state.error && <p className="text-destructive mt-3 text-sm">{state.error}</p>}
          </div>
        </div>
      )}
    </>
  );
}