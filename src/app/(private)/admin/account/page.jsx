import UserList from '@/components/admin/user/UserList'
import AdminHeader from '@/components/layout/AdminHeader'
import React, { Suspense } from 'react'
import UserListSkeleton from '@/components/admin/user/UserListSkeleton'


export default function page() {
    return (
        <div>
            <header>
                <AdminHeader name="Account Management" />
            </header>
            <div>
                <Suspense fallback={<UserListSkeleton />}>
                    <UserList />
                </Suspense>
            </div>
        </div>
    )
}
