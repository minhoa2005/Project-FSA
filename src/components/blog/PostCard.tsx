// FILE: components/post/PostCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import {
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  editComment, 
  toggleHideComment, 
  toggleCommentLike
} from "@/service/users/postActions";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2, Flag } from "lucide-react";
import Image from "next/image";
import ReportModal from "../report/ReportModal";
import { usePostInteractions, CommentData } from "@/components/post/Social_Interactions";
import { CommentSection } from "@/components/post/CommentSection";
import { ShareDialog } from "@/components/post/ShareDialog";
import { toast } from "sonner";

interface PostCardProps {
  post: any;
  isOwner: boolean;
  currentUserId: number;
  onChanged?: () => void;
}

export default function PostCard({
  post,
  isOwner,
  currentUserId,
  onChanged,
}: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);

  const currentUserInfo = { 
    name: "Bạn", 
    avatar: "", 
    id: currentUserId
  };

  const {
    isLiked,
    showComments,
    showShareDialog,
    localPostComments,
    currentLikes,
    totalComments,
    handleLike,
    setShowComments,
    setShowShareDialog,
    handleAddComment,
    handleAddReply,
    handleCommentSuccess,
    handleLikeComment,
    handleEditComment,
    handleToggleHideComment,
    handleShare,
    // Socket handlers
    handleSocketAddComment,
    handleSocketUpdatePostLikes,
    handleSocketUpdateCommentLikes
  } = usePostInteractions({
      id: String(post.id),
      likes: post.likes || 0,
      shares: post.shares || 0,
      comments: post.comments || [],
      text: post.text,
      isLiked: post.isLikedByCurrentUser,
  });

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
        if (Number(newComment.userId) === currentUserId) return;
        handleSocketAddComment(newComment);
    });

    // 2. Nhận Cập nhật Like Bài Viết (Realtime)
    socket.on("sync_post_likes", (data: { likes: number }) => {
        handleSocketUpdatePostLikes(data.likes);
    });

    // 3. Nhận Cập nhật Like Comment (Realtime)
    socket.on("sync_comment_likes", (data: { commentId: string, likes: number }) => {
        handleSocketUpdateCommentLikes(data.commentId, data.likes);
    });

    return () => {
        if (socket) socket.disconnect();
    };
  }, [post.id, currentUserId]);


  // ===============================================
  // HANDLERS
  // ===============================================
  
  // 1. Like Post
  const onLikeClick = async () => {
    // A. Cập nhật UI ngay lập tức (Optimistic) và lấy số like mới
    const newCount = handleLike(); 
    
    // B. Gửi Socket ngay lập tức
    if (socketRef.current) {
        socketRef.current.emit("update_post_like_stats", {
            room: `post_${post.id}`,
            likes: newCount 
        });
    }

    // C. Gọi API lưu DB
    try {
      await toggleLike(post.id, currentUserId);
    } catch (e) { console.error(e); }
  };

  // 2. Like Comment
  const onLikeCommentClick = async (cmtId: string) => {
    if (cmtId.startsWith("temp-")) return;

    // A. Cập nhật UI ngay lập tức
    const newCount = handleLikeComment(cmtId);

    // B. Gửi Socket
    if (socketRef.current) {
        socketRef.current.emit("update_comment_like_stats", {
            room: `post_${post.id}`,
            commentId: cmtId,
            likes: newCount
        });
    }

    // C. Gọi API
    try {
      await toggleCommentLike(Number(cmtId), currentUserId);
    } catch (e) { console.error(e); }
  };

  const onAddCommentClick = async (text: string) => {
    const tempId = `temp-${Date.now()}`;
    handleAddComment(text, tempId, currentUserInfo);
    try {
      const result = await addComment(post.id, currentUserId, text);
      if (result?.success && result.data) {
        handleCommentSuccess(tempId, result.data);
        if (socketRef.current) {
            socketRef.current.emit("new_comment_posted", {
                room: `post_${post.id}`,
                comment: result.data
            });
        }
      } else { toast.error("Gửi bình luận thất bại"); }
    } catch (e) { toast.error("Không thể gửi bình luận"); }
  };

  const onAddReplyClick = async (targetId: string, text: string) => {
    if (targetId.startsWith("temp-")) return;
    const tempId = `temp-${Date.now()}`;
    handleAddReply(targetId, text, tempId, currentUserInfo);
    try {
      const result = await addComment(post.id, currentUserId, text, Number(targetId));
      if (result?.success && result.data) {
        handleCommentSuccess(tempId, result.data);
        if (socketRef.current) {
            socketRef.current.emit("new_comment_posted", {
                room: `post_${post.id}`,
                comment: result.data
            });
        }
      }
    } catch (e) { toast.error("Không thể gửi phản hồi"); }
  };

  const handleUpdate = async (formData: FormData) => {
    try {
      setSubmitting(true);
      if (removedMediaIds.length > 0) formData.set("removeMediaIds", removedMediaIds.join(","));
      await updateBlog(formData);
      setEditing(false);
      setRemovedMediaIds([]);
      onChanged?.();
    } catch (err) { toast.error("Cập nhật thất bại"); } 
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      const fd = new FormData();
      fd.append("blogId", String(post.id));
      await deleteBlog(fd);
      onChanged?.();
    } catch (err) { toast.error("Xoá thất bại"); }
  };

  // --- RENDER UI ---
  const createdAt = new Date(post.createdAt).toLocaleString("vi-VN");
  const displayName = post.username || `User #${post.creatorId}`;
  const avatarUrl = post.imgUrl || post.avatarUrl || "";
  const avatarFallback = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase() || "U";
  const images = (post.media || []).filter((m: any) => m.type === "image" && !removedMediaIds.includes(m.id));
  const videos = (post.media || []).filter((m: any) => m.type === "video" && !removedMediaIds.includes(m.id));

  return (
    <Card className="overflow-hidden shadow-sm mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{displayName}</div>
            <div className="text-xs text-muted-foreground">{createdAt}</div>
          </div>
        </div>
        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={submitting}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-sm">
              <DropdownMenuItem onSelect={() => setEditing(true)}>Chỉnh sửa bài viết</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={() => toast("Xoá?", { action: { label: 'Xoá', onClick: handleDelete } })}>Xóa bài viết</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsModalOpen(true)}> <Flag className="mr-2 h-4 w-4"/> Báo cáo </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-2">
        {!editing ? (
          <>
            {post.text && <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.text}</p>}
            {images.length > 0 && (
              <div className={`grid gap-1 overflow-hidden rounded-lg ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {images.map((m: any) => (
                  <Image key={m.id} src={m.url} alt="" width={1200} height={800} className="aspect-[16/9] w-full object-cover" />
                ))}
              </div>
            )}
            {videos.length > 0 && (
               <div className="space-y-2">
                {videos.map((m: any) => (
                  <video key={m.id} src={m.url} controls className="max-h-[400px] w-full rounded-lg" />
                ))}
              </div>
            )}
          </>
        ) : (
          <form action={handleUpdate} className="space-y-3">
            <input type="hidden" name="blogId" value={post.id} />
            <Textarea name="text" defaultValue={post.text || ""} className="min-h-[80px] text-sm" />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Hủy</Button>
              <Button type="submit" size="sm" disabled={submitting}>Lưu</Button>
            </div>
          </form>
        )}
      </CardContent>

      <ReportModal blogId={post.id} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <CardFooter className="flex flex-col gap-4 border-t px-2 pb-2 pt-1">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground gap-5">
          <span>{currentLikes} lượt thích</span>
          <span>{totalComments} bình luận</span>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
          <Button variant="ghost" size="sm" onClick={onLikeClick} className={`flex items-center justify-center gap-1 ${isLiked ? "text-blue-600" : "text-muted-foreground"}`}><ThumbsUp className="h-4 w-4" /> Thích</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex items-center justify-center gap-1 text-muted-foreground"><MessageCircle className="h-4 w-4" /> Bình luận</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowShareDialog(true)} className="flex items-center justify-center gap-1 text-muted-foreground"><Share2 className="h-4 w-4" /> Chia sẻ</Button>
        </div>

        {showComments && (
          <CommentSection
            comments={localPostComments}
            onAddComment={onAddCommentClick}
            onAddReply={onAddReplyClick}
            onLikeComment={onLikeCommentClick}
            onEditComment={async (id, txt) => handleEditComment(id, txt)} 
            onToggleHideComment={async (id) => handleToggleHideComment(id)}
            currentUserId={currentUserId}
          />
        )}
        {showShareDialog && <ShareDialog onClose={() => setShowShareDialog(false)} onShare={handleShare} />}
      </CardFooter>
    </Card>
  );
}