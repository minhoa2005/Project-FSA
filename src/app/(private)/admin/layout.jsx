import AppSidebar from '@/components/admin/ui/AppSidebar'
import PrivateRoute from '@/components/permission/PrivateRoute'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

export default function layout({ children }) {
    return (
        <div>
            <PrivateRoute allowedRoles={['Admin']}>
                <SidebarProvider>
                    <AppSidebar>
                        <main>
                            <SidebarTrigger />
                            {children}
                        </main>
                    </AppSidebar>
                </SidebarProvider>
            </PrivateRoute>
        </div>
    )
}
