import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/theme/ThemeProvider";


export default function layout({ children }) {
    return (
        <ThemeProvider theme={'light'} forceTheme={'light'}>
            {children}
        </ThemeProvider>
    )
}
