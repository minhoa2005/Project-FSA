// components/layout/SearchDropdown.tsx
"use client";

import { useState, useEffect, useTransition, useEffectEvent } from 'react';
import { searchEverything } from '@/service/users/searchService'; // ← GỌI THẲNG TỪ SERVICE
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';

export default function SearchDropdown() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    users: any[];
    posts: any[];
  }>({ users: [], posts: [] });
  const [isPending, startTransition] = useTransition(); // ← Dùng để gọi async mượt

  // Đây chính là chỗ bạn hỏi: "dùng ở đâu"
  const handleSetResults = useEffectEvent((users: [], posts: []) => setResults({ users, posts }))
  useEffect(() => {
    if (query.length < 2) {
      handleSetResults([], []);
      return;
    }

    // Debounce 300ms
    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        // ← ĐÚNG CHỖ NÀY: gọi thẳng service từ client
        const data = await searchEverything(query);
        setResults(data);
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative flex-1 max-w-md">
      {/* Ô nhập tìm kiếm */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm người dùng, bài viết..."
          className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Dropdown kết quả */}
      {(results.users.length > 0 || results.posts.length > 0 || isPending) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Đang tìm... */}
          {isPending && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Đang tìm kiếm...
            </div>
          )}

          {/* Danh sách người dùng */}
          {results.users.map((user) => (
            <Link
              key={user.id}
              href={`/personal/${user.id}`}
              onClick={() => setQuery('')}
              className="flex items-center gap-3 p-3 hover:bg-accent transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || undefined} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.username}</p>
                {user.fullName !== user.username && (
                  <p className="text-xs text-muted-foreground">{user.fullName}</p>
                )}
              </div>
            </Link>
          ))}

          {/* Danh sách bài viết */}
          {results.posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              onClick={() => setQuery('')}
              className="block p-3 hover:bg-accent border-t text-sm transition-colors"
            >
              <p className="line-clamp-2 text-foreground">{post.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                bởi <span className="font-medium">{post.creatorUsername}</span> ·{' '}
                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </Link>
          ))}

          {/* Không có kết quả */}
          {!isPending && results.users.length === 0 && results.posts.length === 0 && query.length >= 2 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Không tìm thấy kết quả nào cho `{query}`
            </div>
          )}
        </div>
      )}
    </div>
  );
}