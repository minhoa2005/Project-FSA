import "./globals.css";

export default function Layout({ children }) {
    return (
        <html suppressHydrationWarning={true} lang="en">
            <body>
                {children}
            </body >
        </html >
    )
}