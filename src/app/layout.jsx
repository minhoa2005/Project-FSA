import AuthContext from "@/context/AuthContext";
import "./globals.css";
import { Toaster } from "sonner";

export default function Layout({ children }) {
    return (
        <html suppressHydrationWarning={true} lang="en">
            <body>
                <AuthContext>
                    {children}
                </AuthContext>
                <Toaster richColors position="bottom-right" />
            </body >
        </html >
    )
}