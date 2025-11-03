import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export default function Layout({ children }) {
    return (
        <html suppressHydrationWarning={true} lang="en">
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}

