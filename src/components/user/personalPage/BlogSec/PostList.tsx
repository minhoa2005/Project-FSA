"use client";
import { getPersonalBlogs } from '@/service/users/postActions'
import React, { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import Link from 'next/link';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

export default function PostList({ id, watcherId }: { id: number, watcherId?: number }) {
    const [page, setPage] = useState(1);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const lastElement = useRef(null);
    const [end, setEnd] = useState(false);

    const fetchBlogs = useCallback(async (pageNum: number, append: boolean = false) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await getPersonalBlogs(id, watcherId, pageNum);
            if (response.data.length === 0) {
                setEnd(true);
            }
            if (append) {
                setPosts((prev) => [...prev, ...response.data]);
            } else {
                setPosts(response.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const refreshData = useCallback(async () => {
        setPage(1);
        await fetchBlogs(1, false);
    }, [fetchBlogs]);

    useEffect(() => {
        fetchBlogs(1, false);
    }, [id]);

    useEffect(() => {
        if (!lastElement.current) return;
        if (end) return;
        const observer = new IntersectionObserver(async (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoading) {
                const nextPage = page + 1;
                setPage(nextPage);
                await fetchBlogs(nextPage, true);
            }
        },
            {
                root: null,
                rootMargin: '100px 0px 0px 0px',
            })

        observer.observe(lastElement.current);
        return () => observer.disconnect();
    }, [page, isLoading, end])



    return (
        <div className='flex flex-col gap-5 items-center'>
            {id === watcherId && (
                <CreatePost refresh={refreshData} />
            )}
            {posts.map((post, i) => (
                <div key={post.id} className='w-[70%]' id='posts'>
                    <PostCard post={post} refresh={refreshData} userId={id} />
                </div>
            ))}
            {posts.length === 0 ? (<div className='text-muted-foreground mb-5'>Chưa có bài viết nào.</div>) : end ? <div className='text-muted-foreground mb-5'>Đã hết bài viết. <Link href="#top" className='text-blue-400'>Quay về đầu trang?</Link></div> : null}
            <div id='last' className='h-5' ref={lastElement}></div>
        </div>
    )
}
