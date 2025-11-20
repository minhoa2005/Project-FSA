import { AppSidebar } from '@/components/layout/AppSidebar'
import PrivateRoute from '@/components/permission/PrivateRoute'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getPersonalInfo } from '@/service/user/personalInfo';
import React from 'react'

export default function layout({ children }) {

    return (
        <PrivateRoute allowedRoles={'Admin'}>
            <SidebarProvider defaultOpen>
                <AppSidebar />
                <main>
                    {children}
                </main>
            </SidebarProvider>
        </PrivateRoute>
    )
}
