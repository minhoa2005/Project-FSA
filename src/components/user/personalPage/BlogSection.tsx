import React from 'react'
import PostCard from './PostCard'
import PostList from './PostList'


export default function BlogSection({ className, id }: { className?: string, id: number }) {
    return (
        <div className={` ${className}`}>
            <PostList id={id} />
        </div>
    )
}
