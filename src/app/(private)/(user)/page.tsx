"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/context/AuthContext";
import { getBlogs } from "@/service/users/postActions";

import CreatePost from "@/components/blog/CreatePost";
import PostList from "@/components/blog/PostList";
import ContactsSidebar from "@/components/blog/ContactsSidebar";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, authen } = useUser();

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // id tài khoản hiện tại (không fix cứng)
  const currentUserId =
    (user as any)?.id ?? (user as any)?.accountId ?? null;

  // Nếu chưa đăng nhập thì đưa về trang login
  useEffect(() => {
    if (!loading && !authen) {
      router.push("/login");
    }
  }, [loading, authen, router]);

  // Hàm load posts từ server action
  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const data = await getBlogs();
      setPosts(data);
    } catch (err) {
      console.error("Error loading blogs:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Khi đã xác thực xong thì load posts
  useEffect(() => {
    if (authen) {
      void loadPosts();
    }
  }, [authen]);

  // Trong lúc chờ auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg bg-white px-4 py-3 text-sm shadow">
          Đang tải...
        </div>
      </div>
    );
  }

  // Nếu chưa login sẽ bị redirect, nên không render gì thêm
  if (!authen || !currentUserId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 py-4 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        {/* Cột giữa - newsfeed */}
        <div className="space-y-4">
          {/* Ô tạo bài viết giống Facebook */}
          <CreatePost
            currentUser={user}
            onPostCreated={loadPosts}
          />

          {/* Danh sách bài viết */}
          {loadingPosts ? (
            <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
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
        <div className="hidden md:block">
          <ContactsSidebar />
        </div>
      </div>
    </div>
  );
}
