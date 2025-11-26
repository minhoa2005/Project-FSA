import PublicRoute from "@/components/permission/PublicRoute";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme/ThemeProvider";


export default function layout({ children }) {
    return (
        <PublicRoute>
            <div className="light">
                {children}
            </div>
        </PublicRoute>
    )
}
