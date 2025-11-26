import { useState } from "react";
import { ThumbsUp, Send } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useUser } from "@/context/AuthContext";
import { getInitials } from "@/lib/formatter";


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
    const { user } = useUser();

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
                    <div className="rounded-2xl px-3 py-2 border">
                        <div className="flex flex-row items-center mb-1 gap-2">
                            <Avatar className="w-10 h-10 ">
                                <AvatarImage src={user?.imgUrl} alt="A" />
                                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm">{comment.author}</p>
                        </div>
                        {/* Hiển thị "Trả lời [Tên]" nếu là reply */}
                        {comment.replyTo && (
                            <p className="text-xs mb-1">
                                Trả lời <span className="font-medium">{comment.replyTo}</span>
                            </p>
                        )}
                        <p className="">{comment.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-1 px-3">
                        <button
                            onClick={handleLike}
                            className={`text-xs ${isLiked ? "text-blue-600" : "text-primary"
                                } hover:underline`}
                        >
                            Thích
                        </button>
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="text-xs text-primary hover:underline"
                        >
                            Phản hồi
                        </button>
                        <span className="text-xs ">{comment.timestamp}</span>

                        {/* Hiển thị số lượng likes nếu có */}
                        {comment.likes > 0 && (
                            <div className="flex items-center gap-1 text-xs ">
                                <ThumbsUp className="w-3 h-3 fill-blue-500 text-blue-500" />
                                <span>{comment.likes}</span>
                            </div>
                        )}
                    </div>

                    {/* Reply Form */}
                    {showReplyForm && (
                        <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2">

                            <div className="flex-1 relative">
                                <Input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Trả lời ${comment.author}...`}
                                    className="w-full  rounded-full px-4 py-6 pr-10 text-sm "
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    variant="ghost"
                                    className="absolute right-2 top-1/2 -translate-y-1/2  disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
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