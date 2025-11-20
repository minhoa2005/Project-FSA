import AuthContext from "@/context/AuthContext";
import "./globals.css";
import { Toaster } from "sonner";
import { authMe, logout } from "@/service/public/auth/auth";

export default async function Layout({ children }) {
    return (
        <html suppressHydrationWarning={true} lang="en">
            <body>
                <AuthContext authMe={authMe} logout={logout}>
                    {children}
                </AuthContext>
                <Toaster position="bottom-right" />
            </body >
        </html >
    )
}