import { useState } from "react";
import { Send } from "lucide-react";
import { CommentItem, CommentData } from "./CommentItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommentSectionProps {
    comments: CommentData[];
    onAddComment: (content: string) => void;
    onLikeComment: (commentId: string, isLiked: boolean) => void;
    onAddReply: (parentCommentId: string, replyContent: string) => void;
    onEditComment: (commentId: string, newContent: string) => void;
    onToggleHideComment: (commentId: string) => void;
    currentUserId: number; // Prop bắt buộc
}

export function CommentSection({
    comments,
    onAddComment,
    onLikeComment,
    onAddReply,
    onEditComment,
    onToggleHideComment,
    currentUserId
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

    const handleLike = (commentId: string, isLiked: boolean) => {
        const newLikedComments = new Set(likedComments);
        if (isLiked) newLikedComments.add(commentId);
        else newLikedComments.delete(commentId);
        setLikedComments(newLikedComments);
        onLikeComment(commentId, isLiked);
    };

    return (
        <div className="px-4 py-3 w-full border-t">
            <div className="mb-3 space-y-4">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onLike={handleLike}
                        onReply={onAddReply}
                        onEdit={onEditComment}
                        onToggleHide={onToggleHideComment}
                        likedComments={likedComments}
                        currentUserId={currentUserId}
                        level={0}
                    />
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                    <Input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="w-full px-4 py-3 pr-10 text-sm rounded-full"
                    />
                    <Button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
                        variant="ghost"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}