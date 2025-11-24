// src/app/page.tsx
'use client';
import Image from 'next/image';
import { Home, Search, Video, Store, Users, Bell, Menu, User, Plus, Gift, Calendar } from 'lucide-react';
import { useState } from 'react';
import CreatePost from '@/components/blog/CreatePost';
import PostFeed from '@/components/blog/PostFeed';
import ContactsSidebar from '@/components/blog/ContactsSidebar';

export default function HomePage() {
  const [showCreatePost, setShowCreatePost] = useState(false);  // State cho popover CreatePost
  const currentUserId = 1;  // Tạm, từ session sau
  const userName = 'Vũ Ngọc Giang Trừng';  // Tạm từ UserProfile.fullName
  const userAvatar = '/default-avatar.png';  // Từ imgUrl

  return (
    <div className="grid grid-cols-4">
  {/* Cột trái */}
  <div className="col-span-3">
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto pt-20 px-4 space-y-6">
        <CreatePost
          creatorId={currentUserId}
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
        <PostFeed currentUserId={currentUserId} />    

      </div>
    </div>
  </div>

  {/* Cột phải */}
  <div className="col-span-1">
    <ContactsSidebar />
  </div>
</div>

  );
}