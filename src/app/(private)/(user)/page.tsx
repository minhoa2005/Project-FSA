"use client";

import { useEffect, useState } from "react";
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

  const currentUserId = (user as any)?.id ?? (user as any)?.accountId ?? null;

  useEffect(() => {
    if (!loading && !authen) router.push("/login");
  }, [loading, authen, router]);

  const loadPosts = async () => {
    if (!currentUserId) return; // Đợi có ID mới load
    try {
      setLoadingPosts(true);
      const data = await getBlogs(currentUserId); // <--- Truyền ID để check like
      setPosts(data);
    } catch (err) { console.error(err); } 
    finally { setLoadingPosts(false); }
  };

  useEffect(() => {
    if (authen && currentUserId) void loadPosts();
  }, [authen, currentUserId]);
    if (authen) {
      void loadPosts();
    }
  }, [authen]);

  // Trong lúc chờ auth
  if (loading) {
    return (
      <Loading />
    );
  }

  if (loading) return <div>Đang tải...</div>;
  if (!authen || !currentUserId) return null;

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 mt-3 p-3">
          <CreatePost currentUser={user} onPostCreated={loadPosts} />
          {loadingPosts ? <div>Đang tải...</div> : (
            <PostList
              posts={posts}
              currentUserId={currentUserId} // <--- Truyền xuống List
              onPostsChanged={loadPosts}
            />
          )}
        </div>
        <div className="col-span-1 mt-3">
          <ContactsSidebar />
        </div>
      </div>
    </div>
  );
}