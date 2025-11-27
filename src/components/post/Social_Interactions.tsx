import { useState } from "react";

export interface CommentData {
    id: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked?: boolean;
    replies?: CommentData[];
    replyTo?: string; // Tên người được trả lời
}

// --- Helpers ---

// Tìm Root Comment ID cho một targetId bất kỳ (dựa trên cấu trúc đã load về)
export const findRootCommentId = (comments: CommentData[], targetId: string): string | null => {
    // 1. Kiểm tra xem targetId có phải là root không?
    const isRoot = comments.some(c => c.id === targetId);
    if (isRoot) return targetId;

    // 2. Nếu không, tìm trong các replies của từng root
    for (const c of comments) {
        if (c.replies && hasCommentId(c.replies, targetId)) {
            return c.id; // Trả về ID của root chứa comment đó
        }
    }
    return null;
};

const hasCommentId = (comments: CommentData[], id: string): boolean => {
    for (const c of comments) {
        if (c.id === id) return true;
        // Nếu cấu trúc lồng nhau sâu hơn (tuy nhiên logic mới là 2 cấp)
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

// Add Reply: Luôn add vào Root Parent
const addReplyToComment = (comments: CommentData[], rootId: string, newReply: CommentData): CommentData[] => {
    return comments.map(c => {
        if (c.id === rootId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
    });
};

const toggleCommentHelper = (comments: CommentData[], commentId: string): CommentData[] => {
    return comments.map(c => {
        if (c.id === commentId) {
            const newIsLiked = !c.isLiked;
            return {
                ...c,
                isLiked: newIsLiked,
                likes: newIsLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
            };
        }
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: toggleCommentHelper(c.replies, commentId) };
        }
        return c;
    });
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

    // Logic Reply 2 cấp (Facebook Style)
    const handleAddReply = (targetId: string, text: string) => {
        // Tìm Root của thread này
        const rootParentId = findRootCommentId(localPost.comments, targetId);
        const effectiveRootId = rootParentId || targetId;
        
        // Tìm tên người đang được reply (targetId)
        const replyToAuthor = findCommentAuthor(localPost.comments, targetId);

        const newR: CommentData = {
            id: `temp-${Date.now()}`,
            author: "Bạn",
            avatar: "",
            content: text,
            timestamp: "Vừa xong",
            likes: 0,
            // Nếu target không phải là root -> tức là đang reply chéo trong thread -> gán replyTo
            replyTo: (targetId !== effectiveRootId) ? (replyToAuthor || undefined) : undefined,
            replies: []
        };

        const updated = { ...localPost, comments: addReplyToComment(localPost.comments, effectiveRootId, newR) };
        setLocalPost(updated);
        onInteractionUpdate(updated);
    };

    const handleLikeComment = (cmtId: string) => {
        const updated = { ...localPost, comments: toggleCommentHelper(localPost.comments, cmtId) };
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
        handleLike, setShowComments, setShowShareDialog, handleAddComment, handleAddReply, handleLikeComment, handleShare
    };
}