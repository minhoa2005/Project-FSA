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
