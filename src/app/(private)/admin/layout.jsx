import { AppSidebar } from '@/components/admin/ui/AppSidebar';
import PrivateRoute from '@/components/permission/PrivateRoute';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'


import React from 'react'

export default function layout({ children }) {
    return (
        <PrivateRoute allowedRoles={['Admin']}>
            <SidebarProvider defaultOpen>
                <AppSidebar />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </PrivateRoute>
    );
}
