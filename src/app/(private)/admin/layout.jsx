import AdminHeader from '@/components/layout/AdminHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import PrivateRoute from '@/components/permission/PrivateRoute';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { logout } from '@/service/public/auth/auth';


import React from 'react'

export default async function layout({ children }) {
    return (
        <PrivateRoute allowedRoles={['Admin']}>
            <SidebarProvider >
                <AppSidebar />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </PrivateRoute>
    );
}
