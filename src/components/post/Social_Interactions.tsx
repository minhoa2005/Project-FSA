// Social_Interactions.tsx

import { useState } from "react";

import { CommentSection } from "./CommentSection"; 
import { ShareDialog } from "./ShareDialog"; 
import { CommentData } from "./CommentItem"; 

// --- Các Hàm Tiện Ích Tương Tác Xã Hội (Đã trích xuất) ---

// Hàm đệ quy để tìm và thêm reply vào đúng comment
const addReplyToComment = (
  comments: CommentData[], 
  parentId: string, 
  newReply: CommentData
): CommentData[] => {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply]
      };
    } else if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentId, newReply)
      };
    }
    return comment;
  });
};

// Hàm đệ quy để tìm tên tác giả của comment theo ID
const findCommentAuthor = (comments: CommentData[], commentId: string): string | null => {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment.author;
    }
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentAuthor(comment.replies, commentId);
      if (found) return found;
    }
  }
  return null;
};

// Hàm đệ quy để tìm và cập nhật likes của comment/reply
const updateCommentLikes = (
  comments: CommentData[],
  commentId: string,
  isLiked: boolean // true = like, false = unlike
): CommentData[] => {
  return comments.map(comment => {
    if (comment.id === commentId) {
      const newLikes = isLiked ? comment.likes + 1 : comment.likes - 1;
      return { ...comment, likes: Math.max(0, newLikes) };
    } else if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentLikes(comment.replies, commentId, isLiked)
      };
    }
    return comment;
  });
};

// Đếm tổng số comments (bao gồm cả replies ở mọi cấp)
const countAllComments = (comments: CommentData[]): number => {
  return comments.reduce((total, comment) => {
    const repliesCount = comment.replies ? countAllComments(comment.replies) : 0;
    return total + 1 + repliesCount;
  }, 0);
};

// Định nghĩa kiểu dữ liệu cho Post mà hook nhận vào
interface InitialPostData {
    id: string;
    likes: number;
    shares: number;
    comments: CommentData[];
    // Thêm các thuộc tính khác của bài viết nếu cần
    text?: string; 
}

// --- Custom Hook Chứa Logic Tương Tác (usePostInteractions) ---

// Hook này sẽ được PostCard sử dụng
export function usePostInteractions(initialPost: InitialPostData, onInteractionUpdate: (updatedPost: InitialPostData) => void) {
  // localPost chứa state likes/shares/comments được cập nhật
  const [localPost, setLocalPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(false); // Trạng thái nút Like
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Xử lý Like bài viết
  const handleLike = () => {
    const newLikedStatus = !isLiked;
    const newLikeCount = newLikedStatus ? localPost.likes + 1 : localPost.likes - 1;
    
    const updatedPost = { ...localPost, likes: newLikeCount };
    setLocalPost(updatedPost);
    setIsLiked(newLikedStatus);
    onInteractionUpdate(updatedPost);
  };

  // Xử lý thêm Comment
  const handleAddComment = (commentText: string) => {
    const newComment: CommentData = {
      id: Date.now().toString(),
      author: "Bạn", // Giả định
      avatar: "", // Giả định
      content: commentText,
      timestamp: new Date().toLocaleString("vi-VN"), // Giả định
      likes: 0,
      replies: []
    };
    
    const updatedPost = {
      ...localPost,
      comments: [...localPost.comments, newComment]
    };
    setLocalPost(updatedPost);
    onInteractionUpdate(updatedPost);
  };

  // Xử lý thêm Reply
  const handleAddReply = (parentCommentId: string, replyContent: string) => {
    const replyToAuthor = findCommentAuthor(localPost.comments, parentCommentId);
    
    const newReply: CommentData = {
      id: Date.now().toString(),
      author: "Bạn", // Giả định
      avatar: "", // Giả định
      content: replyContent,
      timestamp: new Date().toLocaleString("vi-VN"), // Giả định
      likes: 0,
      replyTo: replyToAuthor || undefined,
      replies: []
    };

    const updatedComments = addReplyToComment(localPost.comments, parentCommentId, newReply);
    const updatedPost = { ...localPost, comments: updatedComments };
    setLocalPost(updatedPost);
    onInteractionUpdate(updatedPost);
  };

  // Xử lý Like Comment/Reply
  const handleLikeComment = (commentId: string, liked: boolean) => {
    const updatedComments = updateCommentLikes(localPost.comments, commentId, liked);
    const updatedPost = { ...localPost, comments: updatedComments };
    setLocalPost(updatedPost);
    onInteractionUpdate(updatedPost);
  };

  // Xử lý Share
  const handleShare = (shareType: string) => {
    const updatedPost = { ...localPost, shares: localPost.shares + 1 };
    setLocalPost(updatedPost);
    onInteractionUpdate(updatedPost);
    setShowShareDialog(false);
  };

  const totalComments = countAllComments(localPost.comments);

  return {
    // States
    isLiked,
    showComments,
    showShareDialog,
    currentLikes: localPost.likes,
    totalComments,
    localPostComments: localPost.comments,
    
    // Handlers
    handleLike,
    setShowComments,
    setShowShareDialog,
    handleAddComment,
    handleAddReply,
    handleLikeComment,
    handleShare,
  };
}

// Export các component con để PostCard có thể sử dụng
export { CommentSection, ShareDialog };