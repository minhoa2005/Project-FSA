"use client"
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import React, { useState } from 'react'
import { Post } from '@/types/user/postT'
import { CommentSection } from '../CommentSec/CommentSection'

export default function PostCardFooter({ post }: { post: Post }) {
    const [open, setOpen] = useState(false);
    return (
        <CardFooter className="flex flex-col gap-4 border-t px-2 pb-2 pt-1">
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground gap-5">
                <span>{post?.likeCount} lượt thích</span>
                <span>{post?.commentCount || 0} bình luận</span>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
                <Button variant="ghost" size="sm" className={`flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground ${post?.isLikedByCurrentUser ? "text-blue-500 hover:bg-blue-100 hover:text-blue-500" : ""}`}>
                    <ThumbsUp className="h-4 w-4" /> Thích
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-muted-foreground" onClick={() => setOpen(!open)}>
                    <MessageCircle className="h-4 w-4" /> Bình luận
                </Button>

                <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Share2 className="h-4 w-4" /> Chia sẻ
                </Button>
            </div>
            {open && (
                <CommentSection comments={[]} />
            )}
        </CardFooter>
    )
}
