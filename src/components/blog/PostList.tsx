"use client";

import PostCard from "./PostCard";

interface PostListProps {
  posts: any[];
  currentUserId: number;
  onPostsChanged?: () => void;
}

export default function PostList({
  posts,
  currentUserId,
  onPostsChanged,
}: PostListProps) {
  if (!posts?.length) {
    return (
      <div className="text-center text-sm">
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
          onChanged={onPostsChanged}
        />
      ))}
    </div>
  );
}
