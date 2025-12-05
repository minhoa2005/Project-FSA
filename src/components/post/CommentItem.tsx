import { useState } from "react";
import { ThumbsUp, Send, MoreHorizontal, Edit2, Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { extractDateAndTime, getInitials } from "@/lib/formatter";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../ui/dropdown-menu";

export interface CommentData {
    id: string;
    userId?: number;
    author: string;
    username?: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    replyTo?: string;
    replies?: CommentData[];
    isHidden?: boolean;
}

interface CommentItemProps {
    comment: CommentData;
    onLike: (commentId: string, isLiked: boolean) => void;
    onReply: (commentId: string, replyContent: string) => void;
    onEdit: (commentId: string, newContent: string) => void;
    onToggleHide: (commentId: string) => void;
    likedComments: Set<string>;
    currentUserId: number; // Để check quyền sở hữu
    level?: number;
}

export function CommentItem({
    comment,
    onLike,
    onReply,
    onEdit,
    onToggleHide,
    likedComments,
    currentUserId,
    level = 0
}: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);

    const isLiked = likedComments.has(comment.id);
    const isHidden = comment.isHidden;

    // Check quyền: Chỉ chủ comment mới được sửa/ẩn
    const isOwner = Number(comment.userId) === Number(currentUserId);

    const handleLike = () => onLike(comment.id, !isLiked);

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyText.trim()) {
            onReply(comment.id, replyText);
            setReplyText("");
            setShowReplyForm(false);
        }
    };

    const handleEditSubmit = () => {
        if (editText.trim() && editText !== comment.content) {
            onEdit(comment.id, editText);
        }
        setIsEditing(false);
    }

    const getAllReplies = (comment: CommentData): CommentData[] => {
        if (!comment.replies || comment.replies.length === 0) return [];
        const flatReplies: CommentData[] = [];
        const traverse = (replies: CommentData[]) => {
            replies.forEach(reply => {
                flatReplies.push(reply);
                if (reply.replies && reply.replies.length > 0) traverse(reply.replies);
            });
        };
        traverse(comment.replies);
        return flatReplies;
    };

    const allReplies = level === 0 ? getAllReplies(comment) : [];

    return (
        <div className="mb-3">
            <div className="flex gap-2 group">
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                    <AvatarImage src={comment?.avatar} alt="A" />
                    <AvatarFallback>{getInitials(comment?.username)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    {!isHidden ? (
                        <>
                            {/* --- CONTENT AREA (HIỆN) --- */}
                            <div className="rounded-2xl px-3 py-2 border bg-gray-50/50 dark:bg-zinc-900/50 w-fit max-w-full">
                                <div className="flex flex-row items-center mb-1 gap-2">
                                    <span className="text-sm font-semibold">{comment?.username}</span>
                                </div>

                                {isEditing ? (
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <Input
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-6 text-xs">Huỷ</Button>
                                            <Button size="sm" onClick={handleEditSubmit} className="h-6 text-xs">Lưu</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {comment.replyTo && (
                                            <p className="text-xs mb-1 text-muted-foreground">
                                                Trả lời <span className="font-medium text-primary">{comment.replyTo}</span>
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-1 px-3">
                                <button
                                    onClick={handleLike}
                                    className={`text-xs font-medium ${isLiked ? "text-blue-600" : "text-muted-foreground"} hover:underline`}
                                >
                                    Thích
                                </button>
                                <button
                                    onClick={() => setShowReplyForm(!showReplyForm)}
                                    className="text-xs font-medium text-muted-foreground hover:underline"
                                >
                                    Phản hồi
                                </button>
                                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>

                                {/* --- MENU ACTIONS (CHỈ HIỆN KHI LÀ CHỦ) --- */}
                                {isOwner && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                                <Edit2 className="w-3 h-3 mr-2" /> Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onToggleHide(comment.id)}>
                                                <EyeOff className="w-3 h-3 mr-2" /> Ẩn bình luận
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}

                                {comment.likes > 0 && (
                                    <div className="flex items-center gap-1 text-xs ml-auto">
                                        <ThumbsUp className="w-3 h-3 fill-blue-500 text-blue-500" />
                                        <span>{comment.likes}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // --- CONTENT AREA (ẨN) ---
                        <div className="border rounded-lg px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-muted-foreground text-sm italic flex items-center justify-between w-fit gap-4">
                            <span>Bình luận của {comment.author} đã bị ẩn</span>
                            {/* Nút hiện lại (Chỉ chủ mới thấy) */}
                            {isOwner && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onToggleHide(comment.id)}
                                    className="h-6 w-6 p-0 hover:bg-transparent"
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    )}

                    {showReplyForm && !isHidden && (
                        <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2">
                            <div className="flex-1 relative">
                                <Input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Trả lời ${comment.author}...`}
                                    className="w-full rounded-full px-4 py-2 pr-10 text-sm h-9"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    variant="ghost"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                >
                                    <Send className="w-3 h-3" />
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* --- REPLIES RECURSIVE --- */}
                    {/* QUAN TRỌNG: Chỉ render replies nếu cha KHÔNG bị ẩn */}
                    {!isHidden && level === 0 && allReplies.length > 0 && (
                        <div className="ml-2 md:ml-6 mt-2 space-y-3 border-l-2 pl-3 md:pl-4 border-gray-100 dark:border-zinc-800">
                            {allReplies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    onLike={onLike}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onToggleHide={onToggleHide}
                                    likedComments={likedComments}
                                    currentUserId={currentUserId}
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