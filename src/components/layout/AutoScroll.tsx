"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AutoScroll({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return children;
}