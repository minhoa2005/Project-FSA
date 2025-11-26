import Header from '@/components/layout/Header'
import PrivateRoute from '@/components/permission/PrivateRoute'
import { getCookie } from '@/config/cookie'
import { redirect } from 'next/navigation';
import React from 'react'

export default async function layout({ children }) {
    return (
        <div>
            <PrivateRoute allowedRoles={['User']}>
                <Header />
                {children}
            </PrivateRoute>
        </div>
    )
}
