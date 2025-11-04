import AuthContext from "@/context/AuthContext";
import "./globals.css";

export default function Layout({ children }) {
    return (
        <html suppressHydrationWarning={true} lang="en">
            <body>
                <AuthContext>
                    {children}
                </AuthContext>
            </body >
        </html >
    )
}