import { ThumbsUp, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatter";

export interface CommentData {
    id: string;
    userId?: number;
    author: string;
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
    level?: number;
}

export function CommentItem({ comment, level = 0 }: CommentItemProps) {
    return (
        <div className="mb-3">
            <div className="flex gap-2 group">
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                    <AvatarImage src={comment?.avatar} alt="A" />
                    <AvatarFallback>{getInitials(comment?.author)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <div className="rounded-2xl px-3 py-2 border bg-gray-50/50 dark:bg-zinc-900/50 w-fit max-w-full">
                        <div className="flex flex-row items-center mb-1 gap-2">
                            <span className="text-sm font-semibold">{comment.author}</span>
                        </div>
                        {comment.replyTo && (
                            <p className="text-xs mb-1 text-muted-foreground">
                                Trả lời <span className="font-medium text-primary">{comment.replyTo}</span>
                            </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-1 px-3">
                        <button className="text-xs font-medium text-muted-foreground hover:underline">
                            Thích
                        </button>
                        <button className="text-xs font-medium text-muted-foreground hover:underline">
                            Phản hồi
                        </button>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>

                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {comment.likes > 0 && (
                            <div className="flex items-center gap-1 text-xs ml-auto">
                                <ThumbsUp className="w-3 h-3 fill-blue-500 text-blue-500" />
                                <span>{comment.likes}</span>
                            </div>
                        )}
                    </div>

                    {/* Replies */}
                    {level === 0 && comment.replies && comment.replies.length > 0 && (
                        <div className="ml-2 md:ml-6 mt-2 space-y-3 border-l-2 pl-3 md:pl-4 border-gray-100 dark:border-zinc-800">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
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