import { ThemeProvider } from '@/components/theme/ThemeProvider'
import React from 'react'

export default function layout({ children }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    )
}
