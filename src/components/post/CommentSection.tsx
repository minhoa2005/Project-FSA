import { useState } from "react";
import { Send } from "lucide-react";

import { CommentItem, CommentData } from "./CommentItem";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface CommentSectionProps {
    comments: CommentData[];
    onAddComment: (content: string) => void;
    onLikeComment: (commentId: string, isLiked: boolean) => void;
    onAddReply: (parentCommentId: string, replyContent: string) => void;
}

export function CommentSection({
    comments,
    onAddComment,
    onLikeComment,
    onAddReply
}: CommentSectionProps) {
    const [commentText, setCommentText] = useState("");
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            onAddComment(commentText);
            setCommentText("");
        }
    };

    // Xử lý toggle like/unlike cho bất kỳ comment/reply nào
    const handleLike = (commentId: string, isLiked: boolean) => {
        const newLikedComments = new Set(likedComments);

        if (isLiked) {
            newLikedComments.add(commentId);
        } else {
            newLikedComments.delete(commentId);
        }

        setLikedComments(newLikedComments);
        onLikeComment(commentId, isLiked);
    };

    return (
        <div className="px-4 py-3 w-full border-t">
            {/* Danh sách comments - Sử dụng CommentItem đệ quy */}
            <div className="mb-3">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onLike={handleLike}
                        onReply={onAddReply}
                        likedComments={likedComments}
                        level={0}
                    />
                ))}
            </div>

            {/* Form nhập comment mới */}
            <form onSubmit={handleSubmit} className="flex  gap-2">
                <div className="flex-1 relative">
                    <Input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="w-full px-4 py-6 pr-10 "
                    />
                    <Button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2  disabled:cursor-not-allowed"
                        variant="ghost"
                    >
                        <Send className="w-2 h-2" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
