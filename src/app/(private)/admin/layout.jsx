import { AppSidebar } from '@/components/layout/AppSidebar'
import PrivateRoute from '@/components/permission/PrivateRoute'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function layout({ children }) {

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <PrivateRoute allowedRoles={'Admin'}>
                <SidebarProvider defaultOpen>
                    <AppSidebar />
                    <main className="flex-1 min-h-screen px-8 py-6 mx-2">
                        {children}
                    </main>
                </SidebarProvider>
            </PrivateRoute>
        </ThemeProvider>
    )
}
