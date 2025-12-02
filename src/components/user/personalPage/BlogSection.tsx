import React from 'react'
import PostList from './PostList'
import CreatePost from './CreatePost'
import { getPersonalBlogs } from '@/service/users/postActions'


export default function BlogSection({ className, id }: { className?: string, id: number }) {
    return (
        <div className={` ${className}`}>
            <PostList id={id} />
        </div>
    )
}
