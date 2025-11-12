"use client"
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { HomeIcon, Settings, User, Sun, Moon, Monitor, Contrast, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useUser } from '@/context/AuthContext'
import { getInitials } from '@/lib/formatter'

export default function Header() {
    const { theme, setTheme } = useTheme();
    const { logout, user } = useUser();
    return (
        <div className='border-b border-gray-300 sticky top-0 z-50'>
            <div className='p-2 flex justify-between items-center gap-4'>
                <div className='flex items-center LogoSearch flex-1'>
                    <Image src="/logo2.png" alt="Logo" width={60} height={60} />
                    <Input placeholder="Search..." className="ml-2 w-[100%] h-[50px]" />
                </div>
                <div className='flex-1 flex justify-center items-center'>
                    <Button variant="ghost" className="p-8 w-[30%] cursor-pointer ">
                        <HomeIcon className="h-10 w-10" />
                    </Button>
                    <Button variant="ghost" className="p-8 w-[30%] cursor-pointer">
                        <User className="h-10 w-10" />
                    </Button>
                </div>
                <div className='flex-1 flex justify-end items-center gap-4'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="w-10 cursor-pointer ">
                                <AvatarImage src="/avatar.png" alt="User Avatar" />
                                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuItem>
                                <Avatar className="h-4 w-4 cursor-pointer ">
                                    <AvatarImage src="/avatar.png" alt="User Avatar" />
                                    <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                                </Avatar>
                                {user?.username}
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Contrast className="mr-2 h-4 w-4" />
                                    Theme
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent side="left" sideOffset={4}>
                                        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                                            <DropdownMenuRadioItem value="light">
                                                <Sun className="mr-2 h-4 w-4" />
                                                Light
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="dark">
                                                <Moon className="mr-2 h-4 w-4" />
                                                Dark
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="system">
                                                <Monitor className="mr-2 h-4 w-4" />
                                                System
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={async () => { await logout(); window.location.href = '/login' }}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>
        </div >
    )
}
