"use client";

import PostCard from "./PostCard";

interface PostListProps {
  posts: any[];
  currentUserId: number;
  currentUserInfo: {
    name: string;
    avatar?: string;
  };
  onPostsChanged?: () => void;
}

export default function PostList({
  posts,
  currentUserId,
  currentUserInfo,
  onPostsChanged,
}: PostListProps) {
  if (!posts?.length) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        Chưa có bài viết nào.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          isOwner={p.creatorId === currentUserId}
          currentUserId={currentUserId}
          currentUserInfo={currentUserInfo}
          onChanged={onPostsChanged}
          sharedPostData={p.sharedPostData}
        />
      ))}
    </div>
  );
}