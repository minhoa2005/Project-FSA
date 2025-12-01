"use client"
import React from 'react'
import { DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../ui/dropdown-menu';
import { Contrast, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUser } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function HeaderClient() {
    const { theme, setTheme } = useTheme();
    const { logout, user } = useUser();
    const router = useRouter()
    return (
        <div>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Contrast className="mr-2 h-4 w-4" />
                    Giao diện
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent sideOffset={7}>
                        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                            <DropdownMenuRadioItem value="light">
                                <Sun className="mr-2 h-4 w-4" />
                                Sáng
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                                <Moon className="mr-2 h-4 w-4" />
                                Tối
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                                <Monitor className="mr-2 h-4 w-4" />
                                Hệ thống
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={async () => { await logout(); window.location.href = '/login' }}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
            </DropdownMenuItem>
        </div>
    )
}
