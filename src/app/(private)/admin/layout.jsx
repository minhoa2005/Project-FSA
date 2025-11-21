import { AppSidebar } from '@/components/layout/AppSidebar'
import PrivateRoute from '@/components/permission/PrivateRoute'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function layout({ children }) {

    return (
        <PrivateRoute allowedRoles={'Admin'} className="light">
            <SidebarProvider defaultOpen>
                <AppSidebar />
                <main className="flex-1 min-h-screen pl-10 pr-5 py-6 mx-2">
                    {children}
                </main>
            </SidebarProvider>
        </PrivateRoute>
    )
}
