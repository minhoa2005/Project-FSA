"use client";

import { useState, useEffect, useRef } from "react";
// Import Socket Client
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
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2, Flag, X } from "lucide-react";
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

  // Ref socket để giữ kết nối không bị reset khi re-render
  const socketRef = useRef<Socket | null>(null);

  const currentUserInfo = {
    name: "Bạn", // Có thể lấy từ UserContext nếu có
    avatar: "",
    id: currentUserId
  };

  // Sử dụng Hook Logic
  const {
    isLiked, showComments, showShareDialog,
    localPostComments, currentLikes, totalComments,
    handleLike, setShowComments, setShowShareDialog,
    handleAddComment, handleAddReply, handleCommentSuccess,
    handleLikeComment, handleEditComment, handleToggleHideComment, handleShare,
    // Socket handlers từ hook
    handleSocketAddComment,
    handleSocketUpdatePostLikes,
    handleSocketUpdateCommentLikes,
    handleSocketToggleHideComment
  } = usePostInteractions({
    id: String(post.id),
    likes: post.likes || 0,
    shares: post.shares || 0,
    comments: post.comments || [],
    text: post.text,
    isLiked: post.isLikedByCurrentUser,
  });

  // ===============================================
  // 1. KẾT NỐI VÀ LẮNG NGHE SOCKET
  // ===============================================
  useEffect(() => {
    // Kết nối tới server hiện tại (cổng 3000)
    socketRef.current = io();

    const socket = socketRef.current;

    socket.on("connect", () => {
      // Tham gia vào phòng của bài viết này
      socket.emit("join_post", post.id);
    });

    // A. Lắng nghe comment mới
    socket.on("receive_comment", (newComment: CommentData) => {
      if (Number(newComment.userId) === currentUserId) return; // Bỏ qua nếu là của mình
      handleSocketAddComment(newComment);
    });

    // B. Lắng nghe cập nhật Like Bài viết
    socket.on("sync_post_likes", (data: { likes: number }) => {
      handleSocketUpdatePostLikes(data.likes);
    });

    // C. Lắng nghe cập nhật Like Comment
    socket.on("sync_comment_likes", (data: { commentId: string, likes: number }) => {
      handleSocketUpdateCommentLikes(data.commentId, data.likes);
    });

    // D. Lắng nghe Ẩn/Hiện Comment
    socket.on("sync_hide_comment", (data: { commentId: string }) => {
      handleSocketToggleHideComment(data.commentId);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [post.id, currentUserId]);


  // ===============================================
  // 2. XỬ LÝ SỰ KIỆN (USER CLICK)
  // ===============================================

  // --- LIKE BÀI VIẾT ---
  const onLikeClick = async () => {
    // 1. UI cập nhật ngay
    const newCount = handleLike();

    // 2. Bắn Socket báo người khác
    if (socketRef.current) {
      socketRef.current.emit("update_post_like_stats", {
        room: `post_${post.id}`,
        likes: newCount
      });
    }

    // 3. Gọi API lưu DB
    try {
      await toggleLike(post.id, currentUserId);
    } catch (e) { console.error(e); }
  };

  // --- LIKE COMMENT ---
  const onLikeCommentClick = async (cmtId: string) => {
    if (cmtId.startsWith("temp-")) return;

    // 1. UI cập nhật ngay
    const newCount = handleLikeComment(cmtId);

    // 2. Bắn Socket báo người khác
    if (socketRef.current) {
      socketRef.current.emit("update_comment_like_stats", {
        room: `post_${post.id}`,
        commentId: cmtId,
        likes: newCount
      });
    }

    // 3. Gọi API
    try {
      await toggleCommentLike(Number(cmtId), currentUserId);
    } catch (e) { console.error(e); }
  };

  // --- ẨN/HIỆN COMMENT ---
  const onToggleHideCommentClick = async (commentId: string) => {
    // 1. UI cập nhật ngay
    handleToggleHideComment(commentId);

    // 2. Bắn Socket
    if (!commentId.startsWith("temp-") && socketRef.current) {
      socketRef.current.emit("toggle_hide_comment", {
        room: `post_${post.id}`,
        commentId: commentId
      });
    }

    // 3. Gọi API
    if (!commentId.startsWith("temp-")) {
      try {
        const res = await toggleHideComment(Number(commentId), currentUserId);
        if (!res.success) {
          toast.error("Lỗi khi ẩn bình luận");
          handleToggleHideComment(commentId); // Revert nếu lỗi
        }
      } catch (e) {
        handleToggleHideComment(commentId); // Revert nếu lỗi
      }
    }
  };

  // --- THÊM COMMENT ---
  const onAddCommentClick = async (text: string) => {
    const tempId = `temp-${Date.now()}`;
    // UI
    handleAddComment(text, tempId, currentUserInfo);
    try {
      // API
      const result = await addComment(post.id, currentUserId, text);
      if (result?.success && result.data) {
        // Cập nhật ID thật
        handleCommentSuccess(tempId, result.data);
        // Socket
        if (socketRef.current) {
          socketRef.current.emit("new_comment_posted", {
            room: `post_${post.id}`,
            comment: result.data
          });
        }
      } else { toast.error("Gửi bình luận thất bại"); }
    } catch (e) { toast.error("Không thể gửi bình luận"); }
  };

  // --- THÊM REPLY ---
  const onAddReplyClick = async (targetId: string, text: string) => {
    if (targetId.startsWith("temp-")) return;
    const tempId = `temp-${Date.now()}`;
    // UI
    handleAddReply(targetId, text, tempId, currentUserInfo);
    try {
      // API
      const result = await addComment(post.id, currentUserId, text, Number(targetId));
      if (result?.success && result.data) {
        // Cập nhật ID thật
        handleCommentSuccess(tempId, result.data);
        // Socket
        if (socketRef.current) {
          socketRef.current.emit("new_comment_posted", {
            room: `post_${post.id}`,
            comment: result.data
          });
        }
      }
    } catch (e) { toast.error("Không thể gửi phản hồi"); }
  };

  // --- EDIT, DELETE, UPDATE POST (Giữ nguyên logic cũ) ---
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
              <DropdownMenuItem onSelect={() => setIsModalOpen(true)}> <Flag className="mr-2 h-4 w-4" /> Báo cáo </DropdownMenuItem>
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
            <input type="hidden" name="removeMediaIds" value={removedMediaIds.join(",")} />
            <Textarea name="text" defaultValue={post.text || ""} className="min-h-[80px] text-sm" placeholder="Bạn đang nghĩ gì?" />
            {(images.length > 0 || videos.length > 0) && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Ảnh / video hiện tại</div>
                <div className="grid grid-cols-2 gap-2">
                  {(post.media || []).filter((m: any) => !removedMediaIds.includes(m.id)).map((m: any) => (
                    <div key={m.id} className="relative overflow-hidden rounded-lg border">
                      {m.type === "image" ? <Image src={m.url} alt="" width={500} height={500} className="h-32 w-full object-cover" /> : <video src={m.url} controls className="h-32 w-full object-cover" />}
                      <Button type="button" onClick={() => setRemovedMediaIds(prev => [...prev, m.id])} className="absolute right-1 top-1 h-6 w-6 rounded-full" variant="destructive" size="icon"><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditing(false); setRemovedMediaIds([]); }} disabled={submitting}>Hủy</Button>
              <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu"}</Button>
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
            onToggleHideComment={onToggleHideCommentClick}
            currentUserId={currentUserId}
          />
        )}
        {showShareDialog && <ShareDialog onClose={() => setShowShareDialog(false)} onShare={handleShare} />}
      </CardFooter>
    </Card>
  );
}