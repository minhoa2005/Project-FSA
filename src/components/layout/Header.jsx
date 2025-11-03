"use client"
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { HomeIcon, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu'

export default function Header() {
    const { theme, setTheme } = useTheme();
    return (
        <div className='border-b border-gray-300 sticky top-0 z-50'>
            <div className='p-2 flex justify-between items-center gap-4'>
                <div className='flex items-center LogoSearch flex-1'>
                    <Image src="/logo2.png" alt="Logo" width={60} height={60} />
                    <Input placeholder="Search..." className="ml-2 w-[100%] h-[50px]" />
                </div>
                <div className='flex-1 flex justify-center items-center'>
                    <Button variant="ghost" className="p-8 cursor-pointer ">
                        <HomeIcon className="h-10 w-10" />
                    </Button>
                    <Button variant="ghost" className="p-8 cursor-pointer">
                        <User className="h-10 w-10" />
                    </Button>
                </div>
                <div className='flex-1 flex justify-end items-center gap-4'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-8 cursor-pointer">
                                <Settings className="h-10 w-10" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    Theme
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent side="left" sideOffset={4}>
                                        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                                            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Avatar className="w-10 cursor-pointer ">
                        <AvatarImage src="/avatar.png" alt="User Avatar" />
                        <AvatarFallback>AV</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    )
}
