"use client";

import { useState } from "react";
import {
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
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
  X,
  Flag,
} from "lucide-react";
import Image from "next/image";
import ReportModal from "../report/ReportModal";
import {
  usePostInteractions,
  findRootCommentId,
} from "@/components/post/Social_Interactions";
import { CommentSection } from "@/components/post/CommentSection";
import { ShareDialog } from "@/components/post/ShareDialog";

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
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Hook tương tác xã hội (Like, Comment, Share)
  const {
    showComments,
    showShareDialog,
    localPostComments,
    handleLike: triggerLikeLocal,
    setShowComments,
    setShowShareDialog,
    handleAddComment: triggerAddCommentLocal,
    handleAddReply: triggerAddReplyLocal,
    handleLikeComment: triggerLikeCommentLocal,
    handleShare,
  } = usePostInteractions(
    {
      id: String(post.id),
      likes: post.likes || 0,
      shares: post.shares || 0,
      comments: post.comments || [],
      text: post.text,
      isLiked: post.isLikedByCurrentUser,
    },
    () => { }
  );

  // --- ACTIONS XỬ LÝ INTERACTION ---

  const onLikeClick = async () => {
    triggerLikeLocal();
    try {
      await toggleLike(post.id, currentUserId);
    } catch (e) {
      console.error(e);
    }
  };

  const onAddCommentClick = async (text: string) => {
    triggerAddCommentLocal(text);
    try {
      await addComment(post.id, currentUserId, text);
    } catch (e) {
      console.error(e);
    }
  };

  const onAddReplyClick = async (targetId: string, text: string) => {
    triggerAddReplyLocal(targetId, text);
    try {
      const rootId =
        findRootCommentId(localPostComments, targetId) || targetId;
      await addComment(post.id, currentUserId, text, Number(rootId));
    } catch (e) {
      console.error("Reply error:", e);
    }
  };

  const onLikeCommentClick = async (cmtId: string) => {
    triggerLikeCommentLocal(cmtId);
    const commentIdNum = Number(cmtId);
    if (isNaN(commentIdNum)) return;
    try {
      await toggleCommentLike(commentIdNum, currentUserId);
    } catch (e) {
      console.error(e);
    }
  };

  // --- XỬ LÝ DỮ LIỆU HIỂN THỊ ---

  const createdAt = new Date(post.createdAt).toLocaleString("vi-VN");
  const displayName =
    post.fullName || post.username || `User #${post.creatorId}`;
  const avatarUrl = post.imgUrl || post.avatarUrl || "";
  const avatarFallback =
    displayName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "U";

  const images = (post.media || []).filter(
    (m: any) => m.type === "image" && !removedMediaIds.includes(m.id)
  );
  const videos = (post.media || []).filter(
    (m: any) => m.type === "video" && !removedMediaIds.includes(m.id)
  );

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN (HANDLERS) ---

  const handleReportClick = (e: any) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleUpdate = async (formData: FormData) => {
    try {
      setSubmitting(true);
      // thêm list id media cần xóa vào formData
      if (removedMediaIds.length > 0) {
        formData.set("removeMediaIds", removedMediaIds.join(","));
      }
      // TODO: Nếu có xử lý upload file mới (newFiles), cần append vào formData ở đây

      await updateBlog(formData);
      setEditing(false);
      setRemovedMediaIds([]);
      setNewFiles([]);
      onChanged?.();
    } catch (err) {
      console.error("Update post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("blogId", String(post.id));
      await deleteBlog(fd);
      onChanged?.();
    } catch (err) {
      console.error("Delete post error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    setNewFiles(list);
  };

  // Phần render preview file mới (tạm thời chưa dùng trong JSX của bạn, nhưng cứ để đây nếu cần)
  const renderNewFilesPreview = () => {
    if (!newFiles.length) return null;
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        {newFiles.map((file, idx) => {
          const url = URL.createObjectURL(file);
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-lg border"
            >
              {isImage && (
                <Image
                  src={url}
                  alt={file.name}
                  width={500}
                  height={500}
                  className="h-40 w-full object-cover"
                />
              )}
              {isVideo && (
                <video
                  src={url}
                  controls
                  className="h-40 w-full object-cover"
                />
              )}
              {!isImage && !isVideo && (
                <div className="h-40 w-full px-2 py-1 text-xs">
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

  // --- RENDER JSX ---

  return (
    <Card className="overflow-hidden shadow-sm">
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
            <div className="text-xs text-muted-foreground">
              {createdAt}
            </div>
          </div>
        </div>

        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
                disabled={submitting}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-sm">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setEditing(true);
                }}
              >
                Chỉnh sửa bài viết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  void handleDelete();
                }}
              >
                Xóa bài viết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-sm">
              <DropdownMenuItem
                onSelect={handleReportClick}
                className="flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                Báo cáo bài viết
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

            {/* Render Images */}
            {images.length > 0 && (
              <div
                className={`grid gap-1 overflow-hidden rounded-lg ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"
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

            {/* Render Videos */}
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
          // --- EDIT MODE ---
          <form
            action={handleUpdate}
            className="space-y-3"
            encType="multipart/form-data"
          >
            <input type="hidden" name="blogId" value={post.id} />
            <input
              type="hidden"
              name="removeMediaIds"
              value={removedMediaIds.join(",")}
            />

            <Textarea
              name="text"
              defaultValue={post.text || ""}
              className="min-h-[80px] text-sm"
              placeholder="Bạn đang nghĩ gì?"
            />

            {/* Edit: Existing Media (with remove button) */}
            {(images.length > 0 || videos.length > 0) && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Ảnh / video hiện tại
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(post.media || [])
                    .filter(
                      (m: any) => !removedMediaIds.includes(m.id)
                    )
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
                              prev.includes(m.id)
                                ? prev
                                : [...prev, m.id]
                            )
                          }
                          className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full"
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

            {/* Nếu muốn cho phép upload thêm file khi edit, bỏ comment dòng dưới */}
            {/* <input type="file" multiple onChange={handleNewFilesChange} /> */}
            {/* {renderNewFilesPreview()} */}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setRemovedMediaIds([]);
                }}
                disabled={submitting}
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

      <CardFooter className="flex flex-col gap-1 border-t px-2 pb-2 pt-1">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground gap-3">
          <span>{post.likes || 0} lượt thích</span>
          <span>{post.comments} bình luận</span>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLikeClick}
            className={`flex items-center justify-center gap-1 rounded-md py-1 hover:bg-muted ${post.isLikedByCurrentUser ? "text-blue-600" : "text-muted-foreground"
              }`}
          >
            <ThumbsUp className="h-4 w-4" />
            Thích
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" />
            Bình luận
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShareDialog(true)}
            className="flex items-center justify-center gap-1 rounded-md py-1 text-muted-foreground hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
        </div>

        {showComments && (
          <CommentSection
            comments={localPostComments}
            onAddComment={onAddCommentClick}
            onLikeComment={onLikeCommentClick}
            onAddReply={onAddReplyClick}
          />
        )}
        {showShareDialog && (
          <ShareDialog
            onClose={() => setShowShareDialog(false)}
            onShare={handleShare}
          />
        )}
      </CardFooter>
    </Card>
  );
}