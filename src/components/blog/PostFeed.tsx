 'use client' 
import Image from 'next/image';
import PostActions from '@/components/blog/PostActions';
import { getBlogsAction, BlogPost } from '@/service/users/postActions';
import { useEffect, useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, Image as ImageIcon, Smile } from 'lucide-react';
import CreatePost from './CreatePost';

interface Props { 
  currentUserId: number;
}

export default function PostFeed({ currentUserId }: Props) {
    const [blogs, setBlogs] = useState([]);
      const [loading, setLoading] = useState(true);
      const [showCreatePost, setShowCreatePost] = useState(false);
    const fetchBlogs = async () => {
    try {
      const res = await getBlogsAction();
      setBlogs(res);
    } catch (err) {
      console.error("Lỗi fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBlogs();
  }, []);
if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải feed...</div>;  // Loading state giống FB
  }

  return (
    <div className="space-y-4">
        <div 
        onClick={() => setShowCreatePost(true)}
        className="p-4 rounded-lg shadow-sm border bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          
          <div className="flex-1">
            <p className="font-semibold text-foreground">Bạn đang nghĩ gì?</p>
            <p className="text-sm text-muted-foreground">Chia sẻ bài viết mới...</p>
          </div>
        </div>
        {/* Options dưới với icons lucide (giống FB) */}
        <div className="flex justify-around mt-3 pt-2 border-t border-border/50 text-sm text-muted-foreground">
          <button type="button" className="flex items-center space-x-2 p-2 hover:bg-primary/10 rounded w-full">
            <ImageIcon className="h-4 w-4" />
            <span>Ảnh/video</span>
          </button>
          <button type="button" className="flex items-center space-x-2 p-2 hover:bg-secondary/10 rounded w-full">
            <Smile className="h-4 w-4" />
            <span>Cảm xúc/hoạt động</span>
          </button>
          <button type="button" className="flex items-center space-x-2 p-2 hover:bg-accent/10 rounded w-full">
            <Share2 className="h-4 w-4" />
            <span>Đời sống</span>
          </button>
        </div>
      </div>

      {/* Render Modal CreatePost */}
      <CreatePost 
        creatorId={currentUserId} 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
      />
      {(blogs || []).map((blog) => (
        <article key={blog.id} className="p-4 rounded-lg shadow-sm border bg-card border-border">
          
          {/* Header */}
          <div className="flex items-start mb-3">
            <Image
              src={blog.imgUrl || '/default-avatar.png'}
              alt={blog.fullName}
              width={40}
              height={40}
              className="rounded-full mr-3"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">{blog.fullName}</h4>
              <time className="text-sm text-muted-foreground">
                {new Date(blog.createdAt).toLocaleString('vi-VN')}
              </time>
            </div>
          </div>

          {/* Text */}
          <p className="mb-3 whitespace-pre-wrap">{blog.text}</p>

          {/* Media */}
          <div className="mb-3">
            {blog.image && (
              <Image 
                src={blog.image}
                alt="Post"
                width={500}
                height={400}
                className="w-full rounded-lg object-cover"
              />
            )}

            {blog.video && (
              <video src={blog.video} controls className="w-full rounded-lg" />
            )}
          </div>

          {/* Like / Comment / Actions */}
          <div className="flex justify-between border-t pt-2 text-sm">
            <div className="flex space-x-6 text-muted-foreground">
              <button className="flex items-center space-x-2 hover:text-primary transition-colors p-1 rounded">
                <ThumbsUp className="h-4 w-4" />
                <span>{blog.likesCount} Thích</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-secondary transition-colors p-1 rounded">
                <MessageCircle className="h-4 w-4" />
                <span>{blog.commentsCount} Bình luận</span>
              </button>
              <button className="flex items-center space-x-2 hover:text-accent transition-colors p-1 rounded">
                <Share2 className="h-4 w-4" />
                <span>Chia sẻ</span>
              </button>
            </div>

            <PostActions
              blogId={blog.id}
              creatorId={blog.creatorId}
              currentUserId={currentUserId}
              text={blog.text}
              image={blog.image}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
