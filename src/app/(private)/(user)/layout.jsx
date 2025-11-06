import Header from '@/components/layout/Header'
import PrivateRoute from '@/components/permission/PrivateRoute'
import React from 'react'

export default function layout({ children }) {
    return (
        <div>
            <PrivateRoute allowedRoles={['User']}>
                <Header />
                {children}
            </PrivateRoute>
        </div>
    )
}
