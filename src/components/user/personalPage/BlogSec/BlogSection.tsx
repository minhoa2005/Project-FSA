import React from 'react'
import PostList from './PostList'
import { getCookie } from '@/config/cookie'
import { verifyToken } from '@/config/jwt'


export default async function BlogSection({ className, id }: { className?: string, id: number }) {
    const user = verifyToken(await getCookie());
    return (
        <div className={` ${className}`}>
            <PostList id={id} watcherId={Number(user.id)} />
        </div>
    )
}
