import { getPersonalBlogs } from '@/service/users/postActions'
import React from 'react'
import PostCard from './PostCard';
import CreatePost from './CreatePost';

export default async function PostList({ id }: { id: number }) {
    const posts = await getPersonalBlogs(id);
    return (
        <div className='flex flex-col gap-5 items-center'>
            <CreatePost />
            {posts.data.map((post) => (
                <PostCard post={post} key={post.id} />
            ))}
        </div>
    )
}
