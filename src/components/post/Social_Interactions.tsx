// FILE: components/post/Social_Interactions.tsx
import { useState, useEffect } from "react";

export interface CommentData {
    id: string;
    userId?: number;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked?: boolean;
    replies?: CommentData[];
    replyTo?: string;
    parentId?: string | number;
    isHidden?: boolean; 
}

// --- Helpers ---
const hasCommentId = (comments: CommentData[], id: string): boolean => {
    for (const c of comments) {
        if (String(c.id) === String(id)) return true;
        if (c.replies && hasCommentId(c.replies, id)) return true;
    }
    return false;
};

const countAllComments = (comments: CommentData[]): number =>
    comments.reduce((t, c) => t + 1 + (c.replies ? countAllComments(c.replies) : 0), 0);

export const findRootCommentId = (comments: CommentData[], targetId: string): string | null => {
    const root = comments.find(c => c.id === targetId);
    if (root) return root.id;
    for (const c of comments) {
        if (c.replies && hasCommentId(c.replies, targetId)) return c.id;
    }
    return null;
};

const findCommentAuthor = (comments: CommentData[], id: string): string | null => {
    for (const c of comments) {
        if (c.id === id) return c.author;
        if (c.replies) {
            const found = findCommentAuthor(c.replies, id);
            if (found) return found;
        }
    }
    return null;
};

export interface InitialPostData {
    id: string;
    likes: number;
    shares: number;
    comments: CommentData[];
    text?: string;
    isLiked?: boolean;
}

export function usePostInteractions(initialPost: InitialPostData) {
    const [localPost, setLocalPost] = useState(initialPost);
    const [isLiked, setIsLiked] = useState(initialPost.isLiked || false);
    const [showComments, setShowComments] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);

    useEffect(() => {
        setLocalPost(initialPost);
        setIsLiked(initialPost.isLiked || false);
    }, [initialPost.id]);

    // ==========================================
    // 1. SOCKET HANDLERS (Nhận dữ liệu từ người khác)
    // ==========================================
    
    // Nhận Comment mới
    const handleSocketAddComment = (newComment: CommentData) => {
        setLocalPost(prev => {
            if (hasCommentId(prev.comments, newComment.id)) return prev;
            
            const currentComments = [...prev.comments];
            if (!newComment.parentId) {
                return { ...prev, comments: [...currentComments, newComment] };
            }

            const addReplyRecursive = (list: CommentData[]): CommentData[] => {
                return list.map(c => {
                    if (String(c.id) === String(newComment.parentId)) {
                        const existingReplies = c.replies || [];
                        if (existingReplies.some(r => String(r.id) === String(newComment.id))) return c;
                        return { ...c, replies: [...existingReplies, newComment] };
                    }
                    if (c.replies && c.replies.length > 0) {
                        return { ...c, replies: addReplyRecursive(c.replies) };
                    }
                    return c;
                });
            };
            return { ...prev, comments: addReplyRecursive(currentComments) };
        });
    };

    // Nhận Update Like Bài Viết
    const handleSocketUpdatePostLikes = (newLikeCount: number) => {
        // Chỉ cập nhật số lượng, không đổi trạng thái isLiked của mình
        setLocalPost(prev => ({ ...prev, likes: newLikeCount }));
    };

    // Nhận Update Like Comment
    const handleSocketUpdateCommentLikes = (commentId: string, newLikeCount: number) => {
        const updateLikesRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (String(c.id) === String(commentId)) {
                    return { ...c, likes: newLikeCount };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateLikesRecursive(c.replies) };
                }
                return c;
            });
        };
        setLocalPost(prev => ({ ...prev, comments: updateLikesRecursive(prev.comments) }));
    };

    // ==========================================
    // 2. USER ACTIONS (Hành động của mình)
    // ==========================================

    // Like Post
    const handleLike = () => {
        const newStatus = !isLiked;
        const newCount = newStatus ? localPost.likes + 1 : Math.max(0, localPost.likes - 1);
        
        setIsLiked(newStatus);
        setLocalPost(prev => ({ ...prev, likes: newCount, isLiked: newStatus }));
        
        // Trả về số lượng mới để PostCard gửi qua Socket
        return newCount; 
    };

    // Like Comment
    const handleLikeComment = (cmtId: string) => {
        let newCountForSocket = 0;
        
        const toggleRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (String(c.id) === String(cmtId)) {
                    const newIsLiked = !c.isLiked;
                    const newLikes = newIsLiked ? c.likes + 1 : Math.max(0, c.likes - 1);
                    newCountForSocket = newLikes; // Lưu lại giá trị mới
                    return { ...c, isLiked: newIsLiked, likes: newLikes };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: toggleRecursive(c.replies) };
                }
                return c;
            });
        };
        
        setLocalPost(prev => ({ ...prev, comments: toggleRecursive(prev.comments) }));
        return newCountForSocket;
    };

    const handleAddComment = (text: string, tempId: string, currentUserInfo: any) => {
        const newC: CommentData = { 
            id: tempId, 
            userId: currentUserInfo.id,
            author: currentUserInfo.name || "Bạn", 
            avatar: currentUserInfo.avatar || "", 
            content: text, 
            timestamp: "Đang gửi...", 
            likes: 0, 
            replies: [],
            isHidden: false
        };
        setLocalPost(prev => ({ ...prev, comments: [...prev.comments, newC] }));
    };

    const handleAddReply = (targetId: string, text: string, tempId: string, currentUserInfo: any) => {
        const rootParentId = findRootCommentId(localPost.comments, targetId);
        const effectiveRootId = rootParentId || targetId;
        const replyToAuthor = findCommentAuthor(localPost.comments, targetId);
        const isReplyingToChild = targetId !== effectiveRootId;

        const newR: CommentData = {
            id: tempId,
            userId: currentUserInfo.id,
            author: currentUserInfo.name || "Bạn", 
            avatar: currentUserInfo.avatar || "", 
            content: text, 
            timestamp: "Đang gửi...", 
            likes: 0, 
            replies: [],
            replyTo: isReplyingToChild ? (replyToAuthor || undefined) : undefined,
            isHidden: false,
            parentId: targetId 
        };

        const insertReplyRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (String(c.id) === String(effectiveRootId)) {
                    return { ...c, replies: [...(c.replies || []), newR] };
                }
                if (c.replies && c.replies.length > 0) {
                     return { ...c, replies: insertReplyRecursive(c.replies) };
                }
                return c;
            });
        }
        setLocalPost(prev => ({ ...prev, comments: insertReplyRecursive(prev.comments) }));
    };

    const handleCommentSuccess = (tempId: string, realData: CommentData) => {
        const replaceRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (c.id === tempId) return { ...realData, replies: c.replies || [] }; 
                if (c.replies && c.replies.length > 0) return { ...c, replies: replaceRecursive(c.replies) };
                return c;
            });
        };
        setLocalPost(prev => ({ ...prev, comments: replaceRecursive(prev.comments) }));
    };

    const handleEditComment = (cmtId: string, newText: string) => {
        const editRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (c.id === cmtId) return { ...c, content: newText };
                if (c.replies && c.replies.length > 0) return { ...c, replies: editRecursive(c.replies) };
                return c;
            });
        };
        setLocalPost(prev => ({ ...prev, comments: editRecursive(prev.comments) }));
    };

    const handleToggleHideComment = (cmtId: string) => {
        const toggleHideRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (c.id === cmtId) return { ...c, isHidden: !c.isHidden };
                if (c.replies && c.replies.length > 0) return { ...c, replies: toggleHideRecursive(c.replies) };
                return c;
            });
        };
        setLocalPost(prev => ({ ...prev, comments: toggleHideRecursive(prev.comments) }));
    };

    const handleShare = (type: string) => {
        setLocalPost(prev => ({ ...prev, shares: prev.shares + 1 }));
        setShowShareDialog(false);
    };

    return {
        isLiked, showComments, showShareDialog,
        currentLikes: localPost.likes,
        totalComments: countAllComments(localPost.comments),
        localPostComments: localPost.comments,
        handleLike, setShowComments, setShowShareDialog, 
        handleAddComment, handleAddReply, handleCommentSuccess,
        handleLikeComment, handleEditComment, handleToggleHideComment, handleShare,
        // EXPORT CÁC HÀM SOCKET
        handleSocketAddComment,
        handleSocketUpdatePostLikes,
        handleSocketUpdateCommentLikes
    };
}