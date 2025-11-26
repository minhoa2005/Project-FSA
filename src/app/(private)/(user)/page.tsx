"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/AuthContext";
import { getBlogs } from "@/service/users/postActions";
import CreatePost from "@/components/blog/CreatePost";
import PostList from "@/components/blog/PostList";
import ContactsSidebar from "@/components/blog/ContactsSidebar";
import Loading from "./loading";

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

  // 2. Hàm load bài viết (sử dụng useCallback để tránh tạo lại hàm không cần thiết)
  const loadPosts = useCallback(async () => {
    if (!currentUserId) return; 

    try {
      // Giữ loadingPosts = true chỉ khi mảng posts đang rỗng (lần đầu load)
      // Nếu muốn hiển thị loading mỗi khi refresh list thì bỏ điều kiện posts.length
      if (posts.length === 0) setLoadingPosts(true);
      
      const data = await getBlogs(currentUserId);
      setPosts(data);
    } catch (err) {
      console.error("Lỗi tải bài viết:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [currentUserId]); // Bỏ 'posts.length' khỏi dependency để tránh loop, chỉ phụ thuộc ID

  // 3. Gọi loadPosts khi đã có user ID
  useEffect(() => {
    if (authen && currentUserId) {
      loadPosts();
    }
  }, [authen, currentUserId, loadPosts]);

  // --- RENDER ---

  // Đang kiểm tra đăng nhập (Global loading)
  if (loading) {
    return <Loading />;
  }

  // Chưa đăng nhập (sẽ bị useEffect đẩy sang login, return null để tránh flash UI)
  if (!authen || !currentUserId) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 container mx-auto pt-4">
        {/* Cột chính: Tạo bài & Danh sách bài */}
        <div className="md:col-span-2 space-y-4">
          <CreatePost currentUser={user} onPostCreated={loadPosts} />
          
          {loadingPosts ? (
            <div className="flex justify-center p-8">
                <span className="text-sm text-muted-foreground">Đang tải bảng tin...</span>
            </div>
          ) : (
            <PostList
              posts={posts}
              currentUserId={currentUserId}
              onPostsChanged={loadPosts}
            />
          )}
        </div>

        {/* Cột bên phải: Danh bạ / Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <ContactsSidebar />
        </div>
      </div>
    </div>
  );
}