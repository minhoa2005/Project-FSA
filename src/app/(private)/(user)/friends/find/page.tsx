import FindFriendPage from '@/components/user/Friend/FindFriendPage'
import { getCookie } from '@/config/cookie'
import { verifyToken } from '@/config/jwt'
import React from 'react'

export default async function page() {
    const userId = verifyToken(await getCookie()).id;
    return (
        <div>
            <FindFriendPage currentUserId={Number(userId)} />
        </div>
    )
}
