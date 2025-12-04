import React from 'react'
import PostList from './PostList'



export default async function BlogSection({ className, id, watcherId }: { className?: string, id: number, watcherId: number }) {
    return (
        <div className={` ${className}`}>
            <PostList id={id} watcherId={watcherId} />
        </div>
    )
}
