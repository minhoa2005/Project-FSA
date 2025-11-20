'use client'
import React, { useEffect, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '../ui/sidebar'
import { AlertCircle, BanIcon, Calendar, CheckCircle2, ChevronUp, createLucideIcon, FileText, Home, Inbox, Loader2, LucideCreativeCommons, MessageSquare, Search, Settings, User, User2, UserPlus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useUser } from '@/context/AuthContext'
import { getAdminInfo } from '@/service/admin/admininfo'
import { useRouter } from 'next/navigation'

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
  const router = useRouter();

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
    <Sidebar className="w-72 bg-white border-gray-300 text-gray-1000">
      <h1 className='flex px-10 pt-5 text-lg uppercase tracking-widest text-gray-700'>Xin chào Admin!</h1>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="space-y-5 py-5">

            <SidebarGroupLabel className="text-sm text-gray-500 uppercase tracking-widest px-4">
              Dashboard
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {dashboard.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="
                   flex items-center gap-4 px-4  text-base
                "
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>


            <SidebarGroupLabel className="text-sm text-gray-500 uppercase tracking-widest px-4">
              Users
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {user.map((u) => (
                <SidebarMenuItem key={u.title}>
                  <SidebarMenuButton
                    asChild
                    className="
                  flex items-center gap-4 px-4  text-base
                "
                  >
                    <a href={u.url}>
                      <u.icon />
                      <span className="font-medium">{u.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>


            <SidebarGroupLabel className="text-sm text-gray-500 uppercase tracking-widest px-4">
              Blog
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {blog.map((b) => (
                <SidebarMenuItem key={b.title}>
                  <SidebarMenuButton
                    asChild
                    className="
                  flex items-center gap-4 px-4  text-base
                "
                  >
                    <a href={b.url}>
                      <b.icon />
                      <span className="font-medium">{b.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>


            <SidebarGroupLabel className="text-sm text-gray-500 uppercase tracking-widest px-4">
              Báo cáo & Kiểm duyệt
            </SidebarGroupLabel>

            <SidebarMenu className="px-2 space-y-1">
              {report.map((r) => (
                <SidebarMenuItem key={r.title}>
                  <SidebarMenuButton
                    asChild
                    className="
                  flex items-center gap-4 px-4  text-base
                "
                  >
                    <a href={r.url}>
                      <r.icon />
                      <span className="font-medium">{r.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-300 py-4">
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

              <DropdownMenuContent side="right" className="w-[--radix-popper-anchor-width]" >
                <DropdownMenuItem className={'font-medium'}>
                  <a href="/admin/reset-pass">
                    Đổi mật khẩu
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout} className={'font-medium'}
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

