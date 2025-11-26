import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { getCookie } from '@/config/cookie';
import { verifyToken } from '@/config/jwt';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function layout({ children }) {
    const cookie = await getCookie();
    if (!cookie) {
        redirect('/login');
    }
    const verified = verifyToken(cookie);
    if (!cookie || !verified) {
        redirect('/login');
    }
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    )
}
