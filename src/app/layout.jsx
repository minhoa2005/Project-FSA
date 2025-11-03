'use client';
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import Header from "@/components/layout/Header";

export default function Layout({ children }) {
    return (
        <html suppressHydrationWarning={true} lang="en">
            <body>
                <ThemeProvider attribute="class">
                    <Header />
                    {children}
                </ThemeProvider>
            </body >
        </html >
    )
}