// FILE: components/post/PostCard.tsx
"use client";
import type { FormEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import {
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  editComment,
  toggleHideComment,
  toggleCommentLike,
} from "@/service/users/postActions";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Image as ImageIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import ReportModal from "../report/ReportModal";
import {
  usePostInteractions,
  CommentData,
} from "@/components/post/Social_Interactions";
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

  // NEW: file mới khi chỉnh sửa
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const currentUserInfo = {
    name: "Bạn",
    avatar: "",
    id: currentUserId,
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
    handleSocketUpdateCommentLikes,
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
    socket.on(
      "sync_comment_likes",
      (data: { commentId: string; likes: number }) => {
        handleSocketUpdateCommentLikes(data.commentId, data.likes);
      },
    );

    return () => {
      if (socket) socket.disconnect();
    };
  }, [post.id, currentUserId]);

  // ===============================================
  // HANDLERS
  // ===============================================

  // 1. Like Post
  const onLikeClick = async () => {
    const newCount = handleLike();

    if (socketRef.current) {
      socketRef.current.emit("update_post_like_stats", {
        room: `post_${post.id}`,
        likes: newCount,
      });
    }

    try {
      await toggleLike(post.id, currentUserId);
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
      await toggleCommentLike(Number(cmtId), currentUserId);
    } catch (e) {
      console.error(e);
    }
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
        currentUserId,
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

  // ====== CẬP NHẬT BÀI VIẾT ======
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  try {
    setSubmitting(true);

    if (removedMediaIds.length > 0) {
      formData.set("removeMediaIds", removedMediaIds.join(","));
    }

    await updateBlog(formData);
    setEditing(false);
    setRemovedMediaIds([]);
    setNewFiles([]);
    onChanged?.();
  } catch (err) {
    toast.error("Cập nhật thất bại");
  } finally {
    setSubmitting(false);
  }
};
  // ====== XOÁ (soft delete bằng isDeleted ở backend) ======
  const handleDelete = async () => {
    try {
      const fd = new FormData();
      fd.append("blogId", String(post.id));
      await deleteBlog(fd);
      onChanged?.();
    } catch (err) {
      toast.error("Xoá thất bại");
    }
  };

  // ====== FILE MỚI KHI EDIT ======
  const handleNewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    setNewFiles(list);
  };

  const renderNewFilesPreview = () => {
    if (!newFiles.length) return null;

    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {newFiles.map((file, idx) => {
          const url = URL.createObjectURL(file);
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          return (
            <div key={idx} className="relative overflow-hidden rounded-lg border">
              {isImage && (
                <Image
                  src={url}
                  alt={file.name}
                  width={500}
                  height={500}
                  className="h-32 w-full object-cover"
                />
              )}
              {isVideo && (
                <video
                  src={url}
                  controls
                  className="h-32 w-full object-cover"
                />
              )}
              {!isImage && !isVideo && (
                <div className="h-24 w-full bg-muted px-2 py-1 text-xs">
                  {file.name}
                </div>
              )}
              <button
                type="button"
                onClick={() =>
                  setNewFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // --- RENDER UI ---
  const createdAt = new Date(post.createdAt).toLocaleString("vi-VN");
  const displayName = post.username || `User #${post.creatorId}`;
  const avatarUrl = post.imgUrl || post.avatarUrl || "";
  const avatarFallback =
    displayName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "U";

  const images = (post.media || []).filter(
    (m: any) => m.type === "image" && !removedMediaIds.includes(m.id),
  );
  const videos = (post.media || []).filter(
    (m: any) => m.type === "video" && !removedMediaIds.includes(m.id),
  );

  return (
    <Card className="overflow-hidden shadow-sm mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={submitting}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-sm">
              <DropdownMenuItem onSelect={() => setEditing(true)}>
                Chỉnh sửa bài viết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() =>
                  toast("Xoá?", {
                    action: { label: "Xoá", onClick: handleDelete },
                  })
                }
              >
                Xóa bài viết
              </DropdownMenuItem>
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
              <DropdownMenuItem onSelect={() => setIsModalOpen(true)}>
                <Flag className="mr-2 h-4 w-4" /> Báo cáo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-2">
        {!editing ? (
          <>
            {post.text && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {post.text}
              </p>
            )}
            {images.length > 0 && (
              <div
                className={`grid gap-1 overflow-hidden rounded-lg ${
                  images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {images.map((m: any) => (
                  <Image
                    key={m.id}
                    src={m.url}
                    alt=""
                    width={1200}
                    height={800}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ))}
              </div>
            )}
            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((m: any) => (
                  <video
                    key={m.id}
                    src={m.url}
                    controls
                    className="max-h-[400px] w-full rounded-lg"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <form
            onSubmit={handleUpdate}
            className="space-y-3"
            encType="multipart/form-data" 
          >
            <input type="hidden" name="blogId" value={post.id} />
            <input
              type="hidden"
              name="removeMediaIds"
              value={removedMediaIds.join(",")}
            />

            {/* input file ẩn cho media mới */}
            <input
              ref={fileInputRef}
              type="file"
              name="newMedia"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleNewFilesChange}
            />

            <Textarea
              name="text"
              defaultValue={post.text || ""}
              className="min-h-[80px] text-sm"
            />

            {/* Ảnh / video hiện tại */}
            {(images.length > 0 || videos.length > 0) && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Ảnh / video hiện tại
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(post.media || [])
                    .filter((m: any) => !removedMediaIds.includes(m.id))
                    .map((m: any) => (
                      <div
                        key={m.id}
                        className="relative overflow-hidden rounded-lg border"
                      >
                        {m.type === "image" ? (
                          <Image
                            src={m.url}
                            alt=""
                            width={500}
                            height={500}
                            className="h-32 w-full object-cover"
                          />
                        ) : (
                          <video
                            src={m.url}
                            controls
                            className="h-32 w-full object-cover"
                          />
                        )}

                        <Button
                          type="button"
                          onClick={() =>
                            setRemovedMediaIds((prev) =>
                              prev.includes(m.id) ? prev : [...prev, m.id],
                            )
                          }
                          className="absolute right-1 top-1 h-6 w-6 rounded-full"
                          variant="destructive"
                          size="icon"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Thêm ảnh / video mới */}
            <div className="rounded-lg border bg-gray-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs font-medium text-gray-600">
                  <ImageIcon className="h-4 w-4" />
                  Thêm ảnh / video mới
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn file
                </Button>
              </div>
              {renderNewFilesPreview()}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setRemovedMediaIds([]);
                  setNewFiles([]);
                }}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <ReportModal
        blogId={post.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <CardFooter className="flex flex-col gap-4 border-t px-2 pb-2 pt-1">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground gap-5">
          <span>{currentLikes} lượt thích</span>
          <span>{totalComments} bình luận</span>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLikeClick}
            className={`flex items-center justify-center gap-1 ${
              isLiked ? "text-blue-600" : "text-muted-foreground"
            }`}
          >
            <ThumbsUp className="h-4 w-4" /> Thích
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center justify-center gap-1 text-muted-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Bình luận
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShareDialog(true)}
            className="flex items-center justify-center gap-1 text-muted-foreground"
          >
            <Share2 className="h-4 w-4" /> Chia sẻ
          </Button>
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
        {showShareDialog && (
          <ShareDialog onClose={() => setShowShareDialog(false)} onShare={handleShare} />
        )}
      </CardFooter>
    </Card>
  );
}
