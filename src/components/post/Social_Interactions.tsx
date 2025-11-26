import { useState } from "react";
import { CommentSection } from "./CommentSection"; 
import { ShareDialog } from "./ShareDialog"; 
import { CommentData } from "./CommentItem"; 

// --- Helpers ---
const addReplyToComment = (comments: CommentData[], parentId: string, newReply: CommentData): CommentData[] => {
    return comments.map(c => c.id === parentId ? {...c, replies: [...(c.replies||[]), newReply]} : (c.replies ? {...c, replies: addReplyToComment(c.replies, parentId, newReply)} : c));
};
const updateCommentLikes = (comments: CommentData[], commentId: string, isLiked: boolean): CommentData[] => {
    return comments.map(c => c.id === commentId ? {...c, likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1), isLiked: isLiked} : (c.replies ? {...c, replies: updateCommentLikes(c.replies, commentId, isLiked)} : c));
};
const findCommentAuthor = (comments: CommentData[], id: string): string|null => {
    for(const c of comments){ if(c.id===id) return c.author; if(c.replies){const f=findCommentAuthor(c.replies,id);if(f)return f;}} return null;
};
const countAllComments = (comments: CommentData[]): number => comments.reduce((t, c) => t + 1 + (c.replies ? countAllComments(c.replies) : 0), 0);

export interface InitialPostData {
    id: string;
    likes: number;
    shares: number;
    comments: CommentData[];
    text?: string;
    isLiked?: boolean; // Nhận trạng thái like từ DB
}

export function usePostInteractions(initialPost: InitialPostData, onInteractionUpdate: (updatedPost: InitialPostData) => void) {
  const [localPost, setLocalPost] = useState(initialPost);
  
  // Khởi tạo state từ DB
  const [isLiked, setIsLiked] = useState(initialPost.isLiked || false); 
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleLike = () => {
    const newStatus = !isLiked;
    setIsLiked(newStatus);
    const newCount = newStatus ? localPost.likes + 1 : Math.max(0, localPost.likes - 1);
    const updated = { ...localPost, likes: newCount, isLiked: newStatus };
    setLocalPost(updated);
    onInteractionUpdate(updated);
  };

  const handleAddComment = (text: string) => {
    const newC: CommentData = { id: `temp-${Date.now()}`, author: "Bạn", avatar: "", content: text, timestamp: "Vừa xong", likes: 0, replies: [] };
    const updated = { ...localPost, comments: [...localPost.comments, newC] };
    setLocalPost(updated);
    onInteractionUpdate(updated);
  };

  const handleAddReply = (parentId: string, text: string) => {
    const replyTo = findCommentAuthor(localPost.comments, parentId);
    const newR: CommentData = { id: `temp-${Date.now()}`, author: "Bạn", avatar: "", content: text, timestamp: "Vừa xong", likes: 0, replyTo: replyTo || undefined, replies: [] };
    const updated = { ...localPost, comments: addReplyToComment(localPost.comments, parentId, newR) };
    setLocalPost(updated);
    onInteractionUpdate(updated);
  };

  const handleLikeComment = (cmtId: string, liked: boolean) => {
    const updated = { ...localPost, comments: updateCommentLikes(localPost.comments, cmtId, liked) };
    setLocalPost(updated);
    onInteractionUpdate(updated);
  };

  const handleShare = (type: string) => {
    setLocalPost(prev => ({...prev, shares: prev.shares + 1}));
    setShowShareDialog(false);
  };

  return {
    isLiked, showComments, showShareDialog, 
    currentLikes: localPost.likes, 
    totalComments: countAllComments(localPost.comments), 
    localPostComments: localPost.comments,
    handleLike, setShowComments, setShowShareDialog, handleAddComment, handleAddReply, handleLikeComment, handleShare
  };
}

export { CommentSection, ShareDialog };