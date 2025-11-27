import { useState, useEffect } from "react";

export interface CommentData {
    id: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked?: boolean;
    replies?: CommentData[];
    replyTo?: string; 
    parentId?: string | number;
}

// --- Helpers ---
export const findRootCommentId = (comments: CommentData[], targetId: string): string | null => {
    const root = comments.find(c => c.id === targetId);
    if (root) return root.id;
    for (const c of comments) {
        if (c.replies && hasCommentId(c.replies, targetId)) return c.id;
    }
    return null;
};

const hasCommentId = (comments: CommentData[], id: string): boolean => {
    for (const c of comments) {
        if (c.id === id) return true;
        if (c.replies && hasCommentId(c.replies, id)) return true;
    }
    return false;
};

const findCommentAuthor = (comments: CommentData[], id: string): string | null => {
    for (const c of comments) {
        if (c.id === id) return c.author;
        if (c.replies) {
            const f = findCommentAuthor(c.replies, id);
            if (f) return f;
        }
    }
    return null;
};

const countAllComments = (comments: CommentData[]): number =>
    comments.reduce((t, c) => t + 1 + (c.replies ? countAllComments(c.replies) : 0), 0);

export interface InitialPostData {
    id: string;
    likes: number;
    shares: number;
    comments: CommentData[];
    text?: string;
    isLiked?: boolean;
}

export function usePostInteractions(initialPost: InitialPostData, onInteractionUpdate: (updatedPost: InitialPostData) => void) {
    const [localPost, setLocalPost] = useState(initialPost);
    const [isLiked, setIsLiked] = useState(initialPost.isLiked || false);
    const [showComments, setShowComments] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);

    // FIX LOOP: Dùng JSON.stringify để so sánh deep equality
    useEffect(() => {
        setLocalPost(prev => {
            if (JSON.stringify(prev) === JSON.stringify(initialPost)) return prev;
            return initialPost;
        });
        setIsLiked(prev => {
             const newStatus = initialPost.isLiked || false;
             if (prev === newStatus) return prev;
             return newStatus;
        });
    }, [JSON.stringify(initialPost)]);

    const handleLike = () => {
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        const newCount = newStatus ? localPost.likes + 1 : Math.max(0, localPost.likes - 1);
        const updated = { ...localPost, likes: newCount, isLiked: newStatus };
        setLocalPost(updated);
        onInteractionUpdate(updated);
    };

    // FIX: Nhận tempId từ UI để hiển thị ngay
    const handleAddComment = (text: string, tempId: string, currentUserInfo?: { name: string, avatar: string }) => {
        const newC: CommentData = { 
            id: tempId, 
            author: currentUserInfo?.name || "Bạn", 
            avatar: currentUserInfo?.avatar || "", 
            content: text, 
            timestamp: "Đang gửi...", 
            likes: 0, 
            replies: [] 
        };
        const updated = { ...localPost, comments: [...localPost.comments, newC] };
        setLocalPost(updated);
        onInteractionUpdate(updated);
    };

    // FIX: Nhận tempId từ UI
    const handleAddReply = (targetId: string, text: string, tempId: string, currentUserInfo?: { name: string, avatar: string }) => {
        const rootParentId = findRootCommentId(localPost.comments, targetId);
        const effectiveRootId = rootParentId || targetId;
        const replyToAuthor = findCommentAuthor(localPost.comments, targetId);
        const isReplyingToChild = targetId !== effectiveRootId;

        const newR: CommentData = {
            id: tempId,
            author: currentUserInfo?.name || "Bạn",
            avatar: currentUserInfo?.avatar || "", 
            content: text, 
            timestamp: "Đang gửi...", 
            likes: 0,
            replyTo: isReplyingToChild ? (replyToAuthor || undefined) : undefined,
            replies: []
        };

        const updatedComments = localPost.comments.map(c => {
            if (c.id === effectiveRootId) {
                return { ...c, replies: [...(c.replies || []), newR] };
            }
            return c;
        });

        const updated = { ...localPost, comments: updatedComments };
        setLocalPost(updated);
        onInteractionUpdate(updated);
    };

    // === NEW: Hàm thay thế tempId bằng realData sau khi Server trả về ===
    const handleCommentSuccess = (tempId: string, realData: CommentData) => {
        const replaceRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (c.id === tempId) {
                    // Giữ lại replies nếu trong lúc chờ user đã kịp reply vào comment ảo
                    return { 
                        ...realData, 
                        replies: c.replies || [] 
                    }; 
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: replaceRecursive(c.replies) };
                }
                return c;
            });
        };

        setLocalPost(prev => {
            const updatedComments = replaceRecursive(prev.comments);
            return { ...prev, comments: updatedComments };
        });
    };

    const handleLikeComment = (cmtId: string) => {
        const toggleRecursive = (list: CommentData[]): CommentData[] => {
            return list.map(c => {
                if (c.id === cmtId) {
                    const newIsLiked = !c.isLiked;
                    return {
                        ...c,
                        isLiked: newIsLiked,
                        likes: newIsLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
                    };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: toggleRecursive(c.replies) };
                }
                return c;
            });
        };

        const updated = { ...localPost, comments: toggleRecursive(localPost.comments) };
        setLocalPost(updated);
        onInteractionUpdate(updated);
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
        handleAddComment, 
        handleAddReply, 
        handleCommentSuccess, // Export function này
        handleLikeComment, 
        handleShare,
        setLocalPost 
    };
}