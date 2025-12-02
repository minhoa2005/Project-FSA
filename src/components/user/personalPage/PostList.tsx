"use client"
import { getPersonalBlogs } from '@/service/users/postActions'
import React, { useEffect, useEffectEvent, useState } from 'react'
import PostCard from './PostCard';
import CreatePost from './CreatePost';

export default function PostList({ id }: { id: number }) {
    const [offset, setOffset] = useState(0);
    // const posts = await getPersonalBlogs(id);
    const [posts, setPosts] = useState<any[]>([]);
    const fetchBlogs = useEffectEvent(async () => {
        const response = await getPersonalBlogs(id);
        setPosts(response.data);
    });
    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div className='flex flex-col gap-5 items-center'>
            <CreatePost />
            {posts.map((post, i) => (
                <div key={post.id} className='w-[50%]' id='posts'>
                    <PostCard post={post} />
                </div>
            ))}
        </div>
    )
}
