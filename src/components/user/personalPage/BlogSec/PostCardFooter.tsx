"use client"
import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { MessageCircle, Share2, ThumbsUp, Loader2 } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { Post } from '@/types/user/postT'
import { CommentSection } from '../CommentSec/CommentSection'
import { toast } from 'sonner'
import { io } from 'socket.io-client'
import { Socket } from 'socket.io-client'
import { useUser } from '@/context/AuthContext'
import { addComment, getCommentsByBlogId, toggleCommentLike, toggleLike } from '@/service/users/postActions'
import { CommentData, usePostInteractions } from '../CommentSec/SocialInteractionP'

export default function PostCardFooter({ post }: { post: Post }) {
    const { user } = useUser();
    const socketRef = useRef<Socket | null>(null);
    const currentUserInfo = {
        name: "Bạn",
        avatar: "",
        id: user?.id,
    };

    const {
        isLiked,
        showComments,
        commentsLoading,
        localPostComments,
        currentLikes,
        handleLike,
        toggleComments,
        handleAddComment,
        handleAddReply,
        handleCommentSuccess,
        handleLikeComment,
        handleEditComment,
        handleToggleHideComment,
        // Socket handlers
        handleSocketAddComment,
        handleSocketUpdatePostLikes,
        handleSocketUpdateCommentLikes,
        totalComments
    } = usePostInteractions(
        {
            id: String(post.id),
            likes: post.likeCount || 0,
            shares: post.shares || 0,
            text: post.text,
            isLiked: post.isLikedByCurrentUser,
        },
    );

    // ===============================================
    // KẾT NỐI SOCKET
    // ===============================================
    useEffect(() => {
        socketRef.current = io(); // Kết nối tới server hiện tại (port 3000)

        const socket = socketRef.current;

        socket.on("connect", () => {
            socket.emit("join_post", post.id);
        });

        // 1. Nhận Comment mới
        socket.on("receive_comment", (newComment: CommentData) => {
            if (Number(newComment.userId) === user?.id) return;
            handleSocketAddComment(newComment);
        });

        // 2. Nhận Cập nhật Like Bài Viết (Realtime)
        socket.on("sync_post_likes", (data: { likes: number }) => {
            handleSocketUpdatePostLikes(data.likes);
        });

        // 3. Nhận Cập nhật Like Comment (Realtime)
        socket.on(
            "sync_comment_likes",
            (data: { commentId: string; likes: number }) => {
                handleSocketUpdateCommentLikes(data.commentId, data.likes);
            },
        );

        return () => {
            if (socket) socket.disconnect();
        };
    }, [post.id, user?.id]);

    // ===============================================
    // HANDLERS
    // ===============================================

    // 1. Like Post
    const onLikeClick = async () => {
        const newCount = handleLike();
        console.log("Emitting like update for post", post.id, "New like count:", newCount);
        if (socketRef.current) {
            socketRef.current.emit("update_post_like_stats", {
                room: `post_${post.id}`,
                likes: newCount,
            });
        }

        try {
            await toggleLike(post.id, user?.id);
        } catch (e) {
            console.error(e);
        }
    };

    // 2. Like Comment
    const onLikeCommentClick = async (cmtId: string) => {
        if (cmtId.startsWith("temp-")) return;

        const newCount = handleLikeComment(cmtId);

        if (socketRef.current) {
            socketRef.current.emit("update_comment_like_stats", {
                room: `post_${post.id}`,
                commentId: cmtId,
                likes: newCount,
            });
        }

        try {
            await toggleCommentLike(Number(cmtId), user?.id);
        } catch (e) {
            console.error(e);
        }
    };

    const onAddCommentClick = async (text: string) => {
        const tempId = `temp-${Date.now()}`;
        handleAddComment(text, tempId, currentUserInfo);
        try {
            const result = await addComment(post.id, user?.id, text);
            if (result?.success && result.data) {
                handleCommentSuccess(tempId, result.data);
                if (socketRef.current) {
                    socketRef.current.emit("new_comment_posted", {
                        room: `post_${post.id}`,
                        comment: result.data,
                    });
                }
            } else {
                toast.error("Gửi bình luận thất bại");
            }
        } catch (e) {
            toast.error("Không thể gửi bình luận");
        }
    };

    const onAddReplyClick = async (targetId: string, text: string) => {
        if (targetId.startsWith("temp-")) return;
        const tempId = `temp-${Date.now()}`;
        handleAddReply(targetId, text, tempId, currentUserInfo);
        try {
            const result = await addComment(
                post.id,
                user?.id,
                text,
                Number(targetId),
            );
            if (result?.success && result.data) {
                handleCommentSuccess(tempId, result.data);
                if (socketRef.current) {
                    socketRef.current.emit("new_comment_posted", {
                        room: `post_${post.id}`,
                        comment: result.data,
                    });
                }
            }
        } catch (e) {
            toast.error("Không thể gửi phản hồi");
        }
    };

    return (
        <CardFooter className="flex flex-col gap-4 border-t px-2 pb-2 pt-1">
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground gap-5">
                <span>{currentLikes} lượt thích</span>
                <span>{post?.commentCount || 0} bình luận</span>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
                <Button variant="ghost" size="sm" onClick={onLikeClick} className={`flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground ${isLiked ? "text-blue-500 hover:bg-blue-100 hover:text-blue-500" : ""}`}>
                    <ThumbsUp className="h-4 w-4" /> Thích
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-muted-foreground" onClick={toggleComments}>
                    <MessageCircle className="h-4 w-4" /> Bình luận
                </Button>

                <Button variant="ghost" size="sm" className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Share2 className="h-4 w-4" /> Chia sẻ
                </Button>
            </div>
            {showComments && (
                <>
                    {commentsLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">Đang tải bình luận...</span>
                        </div>
                    ) : (
                        <CommentSection
                            comments={localPostComments}
                            onAddComment={onAddCommentClick}
                            onAddReply={onAddReplyClick}
                            onLikeComment={onLikeCommentClick}
                            onEditComment={async (id, txt) => handleEditComment(id, txt)}
                            onToggleHideComment={async (id) => handleToggleHideComment(id)}
                            currentUserId={user?.id}
                        />
                    )}
                </>
            )}
        </CardFooter>
    )
}
