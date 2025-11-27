"use client";

import { useState } from "react";
import {
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  toggleCommentLike,
  editComment, 
  toggleHideComment, 
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

// Helper: Tìm nội dung cũ để khôi phục (revert) nếu gọi server thất bại
const findCommentContent = (comments: CommentData[], id: string): string | null => {
    for (const c of comments) {
        if (c.id === id) return c.content;
        if (c.replies) {
            const found = findCommentContent(c.replies, id);
            if (found) return found;
        }
    }
    return null;
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
  
  const currentUserInfo = { 
    name: "Bạn", 
    avatar: "" 
  };

  const {
    isLiked,
    showComments,
    showShareDialog,
    localPostComments,
    currentLikes,
    totalComments,
    handleLike: triggerLikeLocal,
    setShowComments,
    setShowShareDialog,
    handleAddComment: triggerAddCommentLocal,
    handleAddReply: triggerAddReplyLocal,
    handleCommentSuccess,
    handleLikeComment: triggerLikeCommentLocal,
    handleEditComment: triggerEditCommentLocal,
    handleToggleHideComment: triggerToggleHideLocal,
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

  const onLikeClick = async () => {
    triggerLikeLocal();
    try {
      await toggleLike(post.id, currentUserId);
    } catch (e) {
      console.error(e);
    }
  };

  const onAddCommentClick = async (text: string) => {
    const tempId = `temp-${Date.now()}`;
    triggerAddCommentLocal(text, tempId, currentUserInfo);
    try {
      const result = await addComment(post.id, currentUserId, text);
      if (result && result.success && result.data) {
        handleCommentSuccess(tempId, result.data);
      } else {
        toast.error("Gửi bình luận thất bại");
      }
    } catch (e) {
      console.error(e);
      toast.error("Không thể gửi bình luận");
    }
  };

  const onAddReplyClick = async (targetId: string, text: string) => {
    if (targetId.toString().startsWith("temp-")) {
      toast.warning("Đang gửi, vui lòng đợi...");
      return;
    }
    const tempId = `temp-${Date.now()}`;
    triggerAddReplyLocal(targetId, text, tempId, currentUserInfo);
    try {
      const result = await addComment(post.id, currentUserId, text, Number(targetId));
      if (result && result.success && result.data) {
        handleCommentSuccess(tempId, result.data);
      }
    } catch (e) {
      console.error("Reply error:", e);
      toast.error("Không thể gửi phản hồi");
    }
  };
  
  // === LOGIC SỬA COMMENT (ĐÃ KHẮC PHỤC LỖI) ===
  const onEditCommentClick = async (commentId: string, newText: string) => {
      // 1. Lưu state cũ
      const oldText = findCommentContent(localPostComments, commentId) || "";
      
      // 2. Cập nhật UI ngay lập tức
      triggerEditCommentLocal(commentId, newText);

      // 3. Gọi Server
      if (!commentId.startsWith("temp-")) {
          try {
              const res = await editComment(Number(commentId), currentUserId, newText);
              
              if (!res.success) {
                  // Nếu lỗi: Hiện thông báo và Quay lại text cũ
                  toast.error(res.message || "Sửa thất bại");
                  console.error("Edit failed details:", res.message);
                  triggerEditCommentLocal(commentId, oldText);
              } else {
                  toast.success("Đã cập nhật bình luận");
              }
          } catch (e) {
              console.error(e);
              toast.error("Lỗi kết nối");
              triggerEditCommentLocal(commentId, oldText);
          }
      }
  };

  // === LOGIC ẨN/HIỆN COMMENT ===
  const onToggleHideCommentClick = async (commentId: string) => {
      triggerToggleHideLocal(commentId);
      if (!commentId.startsWith("temp-")) {
          try {
              const res = await toggleHideComment(Number(commentId), currentUserId);
              if (!res.success) {
                 toast.error(res.message || "Không thể thay đổi trạng thái");
                 triggerToggleHideLocal(commentId); // Revert
              }
          } catch (e) {
              console.error(e);
              triggerToggleHideLocal(commentId); // Revert
          }
      }
  };

  const onLikeCommentClick = async (cmtId: string) => {
    if (cmtId.toString().startsWith("temp-")) return;
    triggerLikeCommentLocal(cmtId);
    try {
      await toggleCommentLike(Number(cmtId), currentUserId);
    } catch (e) {
      console.error(e);
    }
  };

  const createdAt = new Date(post.createdAt).toLocaleString("vi-VN");
  const displayName = post.username || `User #${post.creatorId}`;
  const avatarUrl = post.imgUrl || post.avatarUrl || "";
  const avatarFallback = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase() || "U";
  const images = (post.media || []).filter((m: any) => m.type === "image" && !removedMediaIds.includes(m.id));
  const videos = (post.media || []).filter((m: any) => m.type === "video" && !removedMediaIds.includes(m.id));

  const handleReportClick = (e: any) => setIsModalOpen(true);
  
  const handleUpdate = async (formData: FormData) => {
    try {
      setSubmitting(true);
      if (removedMediaIds.length > 0) formData.set("removeMediaIds", removedMediaIds.join(","));
      await updateBlog(formData);
      setEditing(false);
      setRemovedMediaIds([]);
      onChanged?.();
    } catch (err) {
      console.error("Update post error:", err);
      toast.error("Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    toast('Bạn có chắc muốn xóa bài viết này?', {
      action: { label: 'Xoá', onClick: () => handleDelete() },
      position: 'top-center',
    })
  }

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("blogId", String(post.id));
      await deleteBlog(fd);
      onChanged?.();
    } catch (err) {
      console.error("Delete post error:", err);
      toast.error("Xoá thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm">
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
              <DropdownMenuItem className="text-destructive" onSelect={() => void confirmDelete()}>Xóa bài viết</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-sm">
              <DropdownMenuItem onSelect={handleReportClick} className="flex items-center gap-2">
                <Flag className="h-4 w-4" /> Báo cáo bài viết
              </DropdownMenuItem>
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
          <Button variant="ghost" size="sm" onClick={onLikeClick} className={`flex items-center justify-center gap-1 rounded-md py-1 ${isLiked ? "text-blue-600" : "text-muted-foreground"}`}><ThumbsUp className="h-4 w-4" /> Thích</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex items-center justify-center gap-1 text-muted-foreground"><MessageCircle className="h-4 w-4" /> Bình luận</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowShareDialog(true)} className="flex items-center justify-center gap-1 text-muted-foreground"><Share2 className="h-4 w-4" /> Chia sẻ</Button>
        </div>

        {showComments && (
          <CommentSection
            comments={localPostComments}
            onAddComment={onAddCommentClick}
            onLikeComment={onLikeCommentClick}
            onAddReply={onAddReplyClick}
            onEditComment={onEditCommentClick}
            onToggleHideComment={onToggleHideCommentClick}
            currentUserId={currentUserId}
          />
        )}
        {showShareDialog && <ShareDialog onClose={() => setShowShareDialog(false)} onShare={handleShare} />}
      </CardFooter>
    </Card>
  );
}