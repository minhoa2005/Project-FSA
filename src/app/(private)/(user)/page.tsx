"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/context/AuthContext";
import { getBlogs } from "@/service/users/postActions";

import CreatePost from "@/components/blog/CreatePost";
import PostList from "@/components/blog/PostList";
import ContactsSidebar from "@/components/blog/ContactsSidebar";
import Loading from "./loading";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, authen } = useUser();

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Lấy ID an toàn từ object user
  const currentUserId = (user as any)?.id ?? (user as any)?.accountId ?? null;

  // 1. Kiểm tra Auth & Redirect
  useEffect(() => {
    if (!loading && !authen) {
      router.push("/login");
    }
  }, [loading, authen, router]);

  // Hàm load posts từ server action
  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const data = await getBlogs(currentUserId);
      setPosts(data);
    } catch (err) {
      console.error("Error loading blogs:", err);
      toast.error("Đã có lỗi xảy ra khi tải bài viết.");
    } finally {
      setLoadingPosts(false);
    }
  };

  // Khi đã xác thực xong thì load posts
  useEffect(() => {
    if (authen) {
      void loadPosts();
    }
  }, [currentUserId]); // Bỏ 'posts.length' khỏi dependency để tránh loop, chỉ phụ thuộc ID

  // 3. Gọi loadPosts khi đã có user ID
  useEffect(() => {
    if (authen && currentUserId) {
      loadPosts();
    }
  }, [authen, currentUserId]);

  // --- RENDER ---

  // Đang kiểm tra đăng nhập (Global loading)
  if (loading) {
    return <Loading />;
  }

  // Nếu chưa login sẽ bị redirect, nên không render gì thêm
  if (!authen || !currentUserId) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 mt-3 p-3">
          <CreatePost
            currentUser={user}
            onPostCreated={loadPosts}
          />

          {loadingPosts ? (
            <div className="rounded-xl p-4 text-sm shadow-sm">
              Đang tải bài viết...
            </div>
          ) : (
            <PostList
              posts={posts}
              currentUserId={currentUserId}
              onPostsChanged={loadPosts}
            />
          )}
        </div>

        {/* Cột phải - sidebar (bạn bè đang online, gợi ý...) */}
        <div className="col-span-1">
          <ContactsSidebar />
        </div>
      </div>
    </div>
  );
}
