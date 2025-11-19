import UserList from '@/components/admin/user/UserList'
import AdminHeader from '@/components/layout/AdminHeader'
import React from 'react'


export default function page() {
    return (
        <div>
            <header>
                <AdminHeader name="Account Management" />
            </header>
            <div>
                <UserList />
            </div>
        </div>
    )
}
