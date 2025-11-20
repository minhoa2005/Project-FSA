import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { getCookie } from '@/config/cookie';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function layout({ children }) {
    const cookie = await getCookie(process.env.COOKIE_NAME || 'project_fsa');
    if (!cookie) {
        redirect('/login');
    }
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    )
}
