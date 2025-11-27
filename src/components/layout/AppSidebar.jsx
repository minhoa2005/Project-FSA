'use client'
import React, { useEffect, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '../ui/sidebar'
import { AlertCircle, BanIcon, Calendar, CheckCircle2, ChevronUp, Contrast, createLucideIcon, FileText, Home, Inbox, Loader2, LucideCreativeCommons, MessageSquare, Monitor, Moon, Search, Settings, Sun, User, User2, UserPlus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useUser } from '@/context/AuthContext'
import { getAdminInfo } from '@/service/admin/admininfo'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import ChangePassAdmin from '../admin/ChangePassAdmin'

const dashboard = [
  {
    title: "Tổng quan hệ thống",
    url: "/admin",
    icon: Home,
  }
]

const user = [
  {
    title: "Danh sách người dùng",
    url: '/admin/user',
    icon: User,
  },
  {
    title: "Thêm tài khoản mới",
    url: '/admin/add',
    icon: UserPlus,
  },
  {
    title: "Tài khoản bị khóa",
    url: '/admin/ban',
    icon: BanIcon,
  },
]

const blog = [
  {
    title: "Quản lý Blogs",
    url: '/admin/blog',
    icon: FileText,
  },
  {
    title: "Quản lý Comments",
    url: '/admin/comment',
    icon: MessageSquare,
  }
]

const report = [
  {
    title: "Reports mới",
    url: '/admin/new-report',
    icon: AlertCircle,
  },
  {
    title: "Đang xử lý",
    url: '/admin/processing-report',
    icon: Loader2,
  },
  {
    title: "Đã giải quyết",
    url: '/admin/done-report',
    icon: CheckCircle2,
  }
]

export function AppSidebar() {

  const { handleLogout } = useUser();
  const [info, setInfo] = useState();
  const { theme, setTheme } = useTheme();
  const pathName = usePathname()

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getAdminInfo();
        // console.log("INFO:", res.data);

        if (res.success) {
          setInfo(res.data);
        }
      } catch (err) {
        console.log("fetch info error")
      }
    }
    fetchInfo();
  }, [])

  return (
    <Sidebar className="w-72 border-gray-300 text-gray-1000 dark:border-[#262626]">
      <h1 className='flex text-start px-6 py-3 text-lg tracking-widest font-bold border-b border-gray-300 dark:border-[#262626]'>BlogG.</h1>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="space-y-4 py-2">

            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-widest px-4 dark:text-gray-200">
              Dashboard
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {dashboard.map((item) => {
                const active = pathName === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn('flex items-center gap-4 px-4  text-base',
                        active && "bg-gray-200 dark:bg-[#262626]"
                      )}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )

              })}
            </SidebarMenu>


            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-widest px-4 dark:text-gray-200">
              Users
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {user.map((u) => {
                const active = pathName === u.url
                return (
                  <SidebarMenuItem key={u.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "flex items-center gap-4 px-4 text-base",
                        active && "bg-gray-200 dark:bg-[#262626]"
                      )}
                    >
                      <a href={u.url}>
                        <u.icon />
                        <span>{u.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )

              })}
            </SidebarMenu>


            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-widest px-4 dark:text-gray-200">
              Blog
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {blog.map((b) => {
                const active = pathName === b.url;
                return (
                  <SidebarMenuItem key={b.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "flex items-center gap-4 px-4 text-base",
                        active && "bg-gray-200 dark:bg-[#262626]"
                      )}
                    >
                      <a href={b.url}>
                        <b.icon />
                        <span>{b.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )

              })}
            </SidebarMenu>


            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-widest px-4 dark:text-gray-200">
              Báo cáo & Kiểm duyệt
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {report.map((r) => {
                const active = pathName === r.url;
                return (
                  <SidebarMenuItem key={r.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "flex items-center gap-4 px-4 text-base",
                        active && "bg-gray-200 dark:bg-[#262626]"
                      )}
                    >
                      <a href={r.url}>
                        <r.icon />
                        <span>{r.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )

              })}
            </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-300 py-3 dark:border-[#262626]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="
                flex items-center gap-4 px-4 py-3  text-base font-medium 
              "
                >
                  <User2 />
                  <span>{info?.fullName || "Null"}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="right" className="w-50">

                <ChangePassAdmin />
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
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

                <DropdownMenuItem
                  onClick={handleLogout}
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

  )
}

