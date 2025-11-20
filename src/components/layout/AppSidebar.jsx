'use client'
import React, { useEffect, useState } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '../ui/sidebar'
import { AlertCircle, BanIcon, Calendar, CheckCircle2, ChevronUp, createLucideIcon, FileText, Home, Inbox, Loader2, LucideCreativeCommons, MessageSquare, Search, Settings, User, User2, UserPlus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useUser } from '@/context/AuthContext'
import { getAdminInfo } from '@/service/admin/admininfo'

const dashboard = [
  {
    title: "Tổng quan hệ thống",
    url: "admin",
    icon: Home,
  }
]

const user = [
  {
    title: "Danh sách users",
    url: 'admin/user',
    icon: User,
  },
  {
    title: "Thêm user mới",
    url: 'admin/add',
    icon: UserPlus,
  },
  {
    title: "User bị khóa",
    url: 'admin/ban',
    icon: BanIcon,
  },
]

const blog = [
  {
    title: "Quản lý Blogs",
    url: 'admin/user',
    icon: FileText,
  },
  {
    title: "Quản lý Comments",
    url: 'admin/comment',
    icon: MessageSquare,
  }
]

const report = [
  {
    title: "Reports mới",
    url: 'report/new',
    icon: AlertCircle,
  },
  {
    title: "Đang xử lý",
    url: 'report/processing',
    icon: Loader2,
  },
  {
    title: "Đã giải quyết",
    url: 'report/done',
    icon: CheckCircle2,
  }
]

export function AppSidebar() {

  const { handleLogout } = useUser();
  const [info, setInfo]  = useState();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getAdminInfo();
        console.log("INFO:", res.data);

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
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>

              <SidebarGroupLabel className={'text-base'}>Dashboard</SidebarGroupLabel>
              <SidebarMenu>
                {dashboard.map((dashboard) => (
                  <SidebarMenuItem key={dashboard.title}>
                    <SidebarMenuButton asChild>
                      <a href={dashboard.url}>
                        <dashboard.icon />
                        <span>{dashboard.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              <SidebarGroupLabel className={'text-base'}>Users</SidebarGroupLabel>
              <SidebarMenu>
                {user.map((u) => (
                  <SidebarMenuItem key={(u.title)}>
                    <SidebarMenuButton asChild>
                      <a href={u.url}>
                        <u.icon />
                        <span>{u.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              <SidebarGroupLabel className={'text-base'}>Blog</SidebarGroupLabel>
              <SidebarMenu>
                {blog.map((b) => (
                  <SidebarMenuItem key={(b.title)}>
                    <SidebarMenuButton asChild>
                      <a href={b.url}>
                        <b.icon />
                        <span>{b.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

              <SidebarGroupLabel className={'text-base'}>Báo cáo & Kiểm duyệt</SidebarGroupLabel>
              <SidebarMenu>
                {report.map((b) => (
                  <SidebarMenuItem key={(b.title)}>
                    <SidebarMenuButton asChild>
                      <a href={b.url}>
                        <b.icon />
                        <span>{b.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 />{info?.fullName ? info.fullName : 'Null'}

                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <a href='admin/reset-pass'>
                      <span>Đổi mật khẩu</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span onClick={handleLogout}>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

  )
}

