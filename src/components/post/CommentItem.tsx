import { useState } from "react";
import { ThumbsUp, Send } from "lucide-react";


export interface CommentData {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replyTo?: string; // Tên người được reply
  replies?: CommentData[]; // Đệ quy: replies cũng có thể có replies
}

interface CommentItemProps {
  comment: CommentData;
  onLike: (commentId: string, isLiked: boolean) => void;
  onReply: (commentId: string, replyContent: string) => void;
  likedComments: Set<string>;
  level?: number; // Cấp độ lồng nhau (0 = comment gốc, 1+ = replies)
}

export function CommentItem({ 
  comment, 
  onLike, 
  onReply, 
  likedComments,
  level = 0 
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const isLiked = likedComments.has(comment.id);

  // Xử lý like/unlike
  const handleLike = () => {
    onLike(comment.id, !isLiked);
  };

  // Xử lý gửi reply
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  // Flatten tất cả replies thành 1 mảng duy nhất (chỉ áp dụng cho level 0)
  const getAllReplies = (comment: CommentData): CommentData[] => {
    if (!comment.replies || comment.replies.length === 0) return [];
    
    const flatReplies: CommentData[] = [];
    const traverse = (replies: CommentData[]) => {
      replies.forEach(reply => {
        flatReplies.push(reply);
        if (reply.replies && reply.replies.length > 0) {
          traverse(reply.replies);
        }
      });
    };
    
    traverse(comment.replies);
    return flatReplies;
  };

  const allReplies = level === 0 ? getAllReplies(comment) : [];

  return (
    <div className="mb-3">
      <div className="flex gap-2">
        
        <div className="flex-1">
          {/* Comment bubble */}
          <div className="bg-gray-100 rounded-2xl px-3 py-2">
            <p className="text-gray-900 text-sm">{comment.author}</p>
            {/* Hiển thị "Trả lời [Tên]" nếu là reply */}
            {comment.replyTo && (
              <p className="text-xs text-gray-600 mb-1">
                Trả lời <span className="font-medium">{comment.replyTo}</span>
              </p>
            )}
            <p className="text-gray-800">{comment.content}</p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-1 px-3">
            <button
              onClick={handleLike}
              className={`text-xs ${
                isLiked ? "text-blue-600" : "text-gray-600"
              } hover:underline`}
            >
              Thích
            </button>
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-gray-600 hover:underline"
            >
              Phản hồi
            </button>
            <span className="text-xs text-gray-500">{comment.timestamp}</span>
            
            {/* Hiển thị số lượng likes nếu có */}
            {comment.likes > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <ThumbsUp className="w-3 h-3 fill-blue-500 text-blue-500" />
                <span>{comment.likes}</span>
              </div>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2">
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Trả lời ${comment.author}...`}
                  className="w-full bg-gray-100 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 disabled:text-gray-400 hover:text-blue-600 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Replies - CHỈ render ở level 0, tất cả replies đều cùng cấp */}
          {level === 0 && allReplies.length > 0 && (
            <div className="ml-10 mt-2 space-y-3">
              {allReplies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  likedComments={likedComments}
                  level={1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}