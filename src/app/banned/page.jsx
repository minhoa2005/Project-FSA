import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { getCookie } from '@/config/cookie'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function page() {
    const cookie = await getCookie();
    if (!cookie) {
        redirect('/login');
    }
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <h1 className="text-3xl font-bold mb-4">Your account has been banned</h1>
                <p className="text-gray-500 mb-6">
                    Please contact support if you believe this is a mistake.
                </p>
                <a href="#" className="text-blue-600 hover:underline">
                    Contact Support
                </a>
            </div>
        </ThemeProvider>
    )
}
