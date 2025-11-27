import React from 'react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import Link from 'next/link';
import { AlertCircle, BanIcon, CheckCircle2, FileText, Home, Loader2, MessageSquare, SlashIcon, User, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';

const path = [
    {
        title: "Tổng quan hệ thống",
        url: "/admin",
        icon: Home,
    },

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
    {
        title: "Quản lý Blogs",
        url: '/admin/blog',
        icon: FileText,
    },
    {
        title: "Quản lý Comments",
        url: '/admin/comment',
        icon: MessageSquare,
    },
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

export default function BreadcrumbAdmin() {

    const pathName = usePathname()

    const url = path.find(u => u.url === pathName)

    return (
        <div>
            <Breadcrumb>
                <BreadcrumbList className={'text-base py-3'}>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/admin">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <SlashIcon />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem >
                        <BreadcrumbPage className={'font-medium'}>
                            {url?.title}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}
