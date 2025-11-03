import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import React from 'react'

export default function layout() {
    return (
        <div>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <Header />
            </ThemeProvider>
        </div>
    )
}
