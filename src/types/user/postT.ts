type Post = {
    id: number;
    text: string;
    creatorId: number;
    createdAt: string;
    updatedAt: string;
    fullName: string;
    imgUrl: string;
    username: string;
    media: { id: number; url: string; mediaType: string }[];
    likeCount: number;
    commentCount?: number;
    isLikedByCurrentUser: boolean;
    shares?: number,
    isShared?: boolean,
    sharedData?: any;
};

export type { Post };