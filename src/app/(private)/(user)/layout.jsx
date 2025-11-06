import PrivateRoute from '@/components/permission/PrivateRoute'
import React from 'react'

export default function layout({ children }) {
    return (
        <div>
            <PrivateRoute allowedRoles={['User']}>
                {children}
            </PrivateRoute>
        </div>
    )
}
