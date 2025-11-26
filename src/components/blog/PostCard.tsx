"use client";

import { useState } from "react";
import { updateBlog, deleteBlog, toggleLike, addComment, toggleCommentLike } from "@/service/users/postActions";

// [QUAN TRỌNG] Import đúng đường dẫn
import { usePostInteractions, findRootCommentId } from "@/components/post/Social_Interactions";
import { CommentSection } from "@/components/post/CommentSection"; // Import trực tiếp component UI
import { ShareDialog } from "@/components/post/ShareDialog";     // Import trực tiếp component UI

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: any;
  isOwner: boolean;
  currentUserId: number;
  onChanged?: () => void;
}

export default function PostCard({ post, isOwner, currentUserId, onChanged }: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
      isLiked, showComments, showShareDialog, currentLikes, totalComments, localPostComments,
      handleLike: triggerLikeLocal, setShowComments, setShowShareDialog, 
      handleAddComment: triggerAddCommentLocal, handleAddReply: triggerAddReplyLocal, 
      handleLikeComment: triggerLikeCommentLocal, handleShare,
  } = usePostInteractions(
      { 
          id: String(post.id),
          likes: post.likes || 0, shares: post.shares || 0, 
          comments: post.comments || [], text: post.text,
          isLiked: post.isLikedByCurrentUser 
      }, 
      () => {}
  );

  // --- ACTIONS ---
  
  const onLikeClick = async () => {
    triggerLikeLocal();
    try { await toggleLike(post.id, currentUserId); } catch(e) { console.error(e); }
  };

  const onAddCommentClick = async (text: string) => {
    triggerAddCommentLocal(text);
    try { await addComment(post.id, currentUserId, text); } catch(e) { console.error(e); }
  };

  const onAddReplyClick = async (targetId: string, text: string) => {
    triggerAddReplyLocal(targetId, text);
    try { 
        const rootId = findRootCommentId(localPostComments, targetId) || targetId;
        await addComment(post.id, currentUserId, text, Number(rootId)); 
    } catch(e) { 
        console.error("Reply error:", e); 
    }
  };

  // [THAY ĐỔI] Logic Like Comment Toggle
  // Không cần tham số 'liked' nữa, vì hook đã tự xử lý toggle
  const onLikeCommentClick = async (cmtId: string) => {
    // 1. Update UI ngay lập tức
    triggerLikeCommentLocal(cmtId);

    // 2. Gọi API Toggle
    const commentIdNum = Number(cmtId);
    if (isNaN(commentIdNum)) return;
    try { 
        await toggleCommentLike(commentIdNum, currentUserId); 
    } catch(e) { 
        console.error(e); 
        // Nếu lỗi mạng, có thể gọi lại triggerLikeCommentLocal(cmtId) để rollback UI
    }
  };

  // ... Logic Edit/Delete giữ nguyên ...
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);
  const displayName = post.fullName || post.username || `User`;
  const avatarUrl = post.imgUrl || "";
  
  const handleUpdate = async (formData: FormData) => {
    try { 
        setSubmitting(true); 
        if(removedMediaIds.length) formData.set("removeMediaIds", removedMediaIds.join(",")); 
        await updateBlog(formData); 
        setEditing(false); 
        setRemovedMediaIds([]); 
        onChanged?.(); 
    } catch(e) { console.error(e); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => { 
    if(!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
        setSubmitting(true);
        const fd = new FormData();
        fd.append("blogId", String(post.id));
        await deleteBlog(fd); 
        onChanged?.(); 
    } catch(e) { console.error(e); } finally { setSubmitting(false); }
  };

  const images = (post.media || []).filter((m: any) => m.type === "image" && !removedMediaIds.includes(m.id));
  const videos = (post.media || []).filter((m: any) => m.type === "video" && !removedMediaIds.includes(m.id));

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-2">
            <Avatar><AvatarImage src={avatarUrl}/><AvatarFallback>{displayName[0]}</AvatarFallback></Avatar>
            <div><div className="text-sm font-semibold">{displayName}</div><div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString("vi-VN")}</div></div>
        </div>
        {isOwner && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={()=>setEditing(true)}>Sửa</DropdownMenuItem><DropdownMenuItem onClick={handleDelete} className="text-destructive">Xóa</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        {!editing ? (
            <>
                <p className="whitespace-pre-wrap text-sm">{post.text}</p>
                {images.length>0 && <div className="grid grid-cols-2 gap-1">{images.map((m:any)=><Image key={m.id} src={m.url} width={500} height={300} alt="" className="w-full object-cover"/>)}</div>}
                {videos.length>0 && <div className="space-y-2">{videos.map((m:any)=><video key={m.id} src={m.url} controls className="max-h-[400px] w-full rounded-lg"/>)}</div>}
            </>
        ) : <form action={handleUpdate}><Textarea name="text" defaultValue={post.text}/><Button type="submit" disabled={submitting}>Lưu</Button></form>}
      </CardContent>
      <CardFooter className="flex flex-col gap-1 border-t px-2 pb-2 pt-1">
        <div className="flex justify-between px-1 text-xs text-muted-foreground"><span>{currentLikes} Thích</span><span>{totalComments} Bình luận</span></div>
        <div className="grid grid-cols-3 gap-4 text-xs mt-1">
          <Button onClick={onLikeClick} variant="ghost" size="sm" className={isLiked ? "text-blue-500" : "text-muted-foreground"}><ThumbsUp className={`h-4 w-4 mr-1 ${isLiked?"fill-blue-500":""}`}/>Thích</Button>
          <Button onClick={()=>setShowComments(!showComments)} variant="ghost" size="sm"><MessageCircle className="h-4 w-4 mr-1"/>Bình luận</Button>
          <Button onClick={()=>setShowShareDialog(true)} variant="ghost" size="sm"><Share2 className="h-4 w-4 mr-1"/>Chia sẻ</Button>
        </div>
        
        {/* Truyền onLikeCommentClick (chỉ nhận ID) xuống UI */}
        {showComments && <CommentSection comments={localPostComments} onAddComment={onAddCommentClick} onLikeComment={onLikeCommentClick} onAddReply={onAddReplyClick}/>}
        {showShareDialog && <ShareDialog onClose={()=>setShowShareDialog(false)} onShare={handleShare}/>}
      </CardFooter>
    </Card>
  );
}