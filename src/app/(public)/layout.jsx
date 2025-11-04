import PublicRoute from "@/components/auth/PublicRoute";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme/ThemeProvider";


export default function layout({ children }) {
    return (
        <PublicRoute>
            <ThemeProvider theme={'light'} forceTheme={'light'}>
                {children}
            </ThemeProvider>
        </PublicRoute>
    )
}
