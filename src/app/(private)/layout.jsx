import PrivateRoute from '@/components/permission/PrivateRoute'
import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import React from 'react'

export default function layout({ children }) {
    return (
        <div>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        </div>
    )
}
