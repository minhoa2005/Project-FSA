import { useState } from "react";
// Import các type nếu cần (giả định CommentData đã có hoặc define ở đây)
export interface CommentData {
    id: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked?: boolean; // Quan trọng: trường này để biết trạng thái hiện tại
    replies?: CommentData[];
    replyTo?: string;
}

// --- Helpers ---

// Helper đệ quy tìm ID (để dùng cho hàm findRoot)
const hasCommentId = (comments: CommentData[], id: string): boolean => {
    for (const c of comments) {
        if (c.id === id) return true;
        if (c.replies && hasCommentId(c.replies, id)) return true;
    }
    return false;
};

// Helper tìm Root ID (giữ nguyên logic 2 cấp)
export const findRootCommentId = (comments: CommentData[], targetId: string): string | null => {
    for (const c of comments) {
        if (c.id === targetId) return c.id;
        if (c.replies && hasCommentId(c.replies, targetId)) return c.id;
    }
    return null;
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

const addReplyToComment = (comments: CommentData[], parentId: string, newReply: CommentData): CommentData[] => {
    return comments.map(c =>
        c.id === parentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : (c.replies ? { ...c, replies: addReplyToComment(c.replies, parentId, newReply) } : c)
    );
};

// [THAY ĐỔI QUAN TRỌNG] Helper Toggle Like Comment
const toggleCommentHelper = (comments: CommentData[], commentId: string): CommentData[] => {
    return comments.map(c => {
        // Tìm thấy comment
        if (c.id === commentId) {
            const newIsLiked = !c.isLiked; // Đảo ngược trạng thái
            return {
                ...c,
                isLiked: newIsLiked,
                likes: newIsLiked ? c.likes + 1 : Math.max(0, c.likes - 1) // Tăng hoặc giảm like
            };
        }
        // Tìm trong replies nếu có
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

    // Like Post (Toggle)
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

    // Logic Reply 2 cấp
    const handleAddReply = (targetId: string, text: string) => {
        const rootParentId = findRootCommentId(localPost.comments, targetId);
        const effectiveParentId = rootParentId || targetId;
        const replyToAuthor = findCommentAuthor(localPost.comments, targetId);

        const newR: CommentData = {
            id: `temp-${Date.now()}`,
            author: "Bạn",
            avatar: "",
            content: text,
            timestamp: "Vừa xong",
            likes: 0,
            replyTo: (targetId !== effectiveParentId) ? (replyToAuthor || undefined) : undefined,
            replies: []
        };

        const updated = { ...localPost, comments: addReplyToComment(localPost.comments, effectiveParentId, newR) };
        setLocalPost(updated);
        onInteractionUpdate(updated);
    };

    // [THAY ĐỔI] Handle Like Comment (Chỉ nhận ID -> Toggle)
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