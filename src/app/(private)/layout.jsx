import PrivateRoute from '@/components/permission/PrivateRoute'
import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import React from 'react'

export default function layout({ children }) {
    return (
        <div className='light'>
            <PrivateRoute allowedRoles={['User', 'Admin']}>
                <Header />
                {children}
            </PrivateRoute>
        </div>
    )
}
