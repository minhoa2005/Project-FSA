// FILE: components/blog/PostList.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PostCard from "@/components/blog/PostCard";
import { getBlogsWithShare } from "@/service/users/postActions";

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
  const [items, setItems] = useState<any[]>(posts || []);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ khi props.posts thay đổi (ví dụ sau khi tạo / sửa / xoá)
  useEffect(() => {
    setItems(posts || []);
    // Reset lại trạng thái load thêm
    setHasMore(true);
  }, [posts]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    if (!currentUserId) return;

    try {
      setLoadingMore(true);

      // offset = số bài hiện đã có
      const offset = items.length;
      const newPosts = await getBlogsWithShare(currentUserId, offset, 5);

      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      setItems((prev) => {
        const existIds = new Set(prev.map((p: any) => p.id));
        const filtered = newPosts.filter((p: any) => !existIds.has(p.id));
        return [...prev, ...filtered];
      });

      if (newPosts.length < 5) {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Load more error:", e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentUserId, items.length]);

  // IntersectionObserver để trigger loadMore khi chạm đáy
  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" } // preload sớm một chút
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl  p-4 text-sm text-center  shadow-sm">
        Chưa có bài viết nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((post) => (

        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          isOwner={post.creatorId === currentUserId}
          onChanged={onPostsChanged}
        />
      ))}

      {/* Loader cho infinite scroll */}
      <div
        ref={loaderRef}
        className="py-4 text-center text-xs "
      >
        {loadingMore
          ? "Đang tải thêm bài viết..."
          : hasMore
            ? "Kéo xuống để xem thêm"
            : "Đã hết bài viết"}
      </div>
    </div>
  );
}
