import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import Header from "@/components/layout/Header";

export default function Layout({ children }) {
    return (
        <html suppressHydrationWarning={true} lang="en">
            <body className="">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                </ThemeProvider>
            </body >
        </html >
    )
}