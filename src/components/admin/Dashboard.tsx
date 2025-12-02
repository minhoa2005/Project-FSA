import React, { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel'
import { Card, CardContent } from '../ui/card'
import BreadcrumbAdmin from './Breadcrumb'
import { countAccBan, countAccount, countBlogs, countReportPending, get5accNew, get5Blogs } from '@/service/admin/dashboard'
import { Ban, Globe, KeyRound, Lock, Unlock } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";

import { toast } from 'sonner'
import { sendNewPassword } from '@/config/emailService'
import { banAcc, getAllUser, getEmailAccById, resetPassByAdmin, unBanAcc } from '@/service/admin/accountManager'
import { hidenBlog, publicBlog } from '@/service/admin/blogManager'

interface Account {
    id: number,
    username: string,
    email: string,
    roleId: number,
    createdAt: string,
    isActive: boolean
}

interface Blog {
    id: number,
    text: string,
    username: string,
    createdAt: string,
    isDeleted: boolean
}

export default function Dashboard() {
    const [countAcc, setCountAcc] = useState()
    const [countBlog, setCountBlog] = useState()
    const [countBan, setCountBan] = useState()
    const [countReport, setCountReport] = useState()
    const [account, setAccount] = useState<Account[]>([])
    const [blog, setBlog] = useState<Blog[]>([])

    const handleBan = async (id: number) => {
        // console.log(id)
        try {
            const res = await banAcc(id);
            if (res) {
                const resp = await get5accNew();
                setAccount(resp.data)

                const dataCountBan = await countAccBan()
                setCountBan(dataCountBan.data.total)
                toast.success("Khóa tài khoản thành công!");
            } else {
                toast.error("Lỗi khóa tài khoản!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khóa tài khoản!");
        }
    };

    const handleUnBan = async (id: number) => {
        try {
            const res = await unBanAcc(id);
            if (res) {
                const resp = await get5accNew();
                setAccount(resp.data)

                const dataCountBan = await countAccBan()
                setCountBan(dataCountBan.data.total)

                toast.success("Mở khóa tài khoản thành công!")
            } else {
                toast.error("Mở khóa tài khoản không thành công!")
            }
        } catch (err) {
            console.log(err)
            toast.error("Lỗi mở khóa tài khoản!")
        }
    }

    const handleResetPass = async (id: number) => {
        try {
            const res = await resetPassByAdmin(id);
            if (res.success) {
                const acc = await getEmailAccById(id)
                const email = acc?.email
                const username = acc?.username


                const newPass = res.newPass
                // console.log(newPass)
                sendNewPassword(email, newPass)
                toast.success(
                    <div>
                        Bạn đã đặt lại mật khẩu tài khoản <span className={'font-bold text-red-500'}>{username}</span> thành công!
                    </div>
                )
            } else {
                toast.error('Lỗi đặt lại mật khẩu')
            }
        } catch (err) {
            console.log('err resset pass')
        }
    }

    const handleHiden = async (id: number) => {
        try {
            const res = await hidenBlog(id)
            // console.log(id)
            if (res) {
                const data = await get5Blogs()
                setBlog(data.data)
                toast.success('Ẩn bài viết thành công!')
            } else {
                toast.error('Lỗi ẩn bài viết')
            }
        } catch (err) {
            console.log('err hiden blog fe')
        }
    }

    const handlePublic = async (id: number) => {
        try {
            const res = await publicBlog(id)
            if (res) {
                const data = await get5Blogs()
                setBlog(data.data)

                toast.success('Hiện bài viết thành công')
            } else {
                toast.error('Lỗi hiện bài viết')
            }
        } catch (err) {
            console.log('Err public blog fe', err)
        }
    }

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const dataCountAcc = await countAccount()

                const dataCountBlogs = await countBlogs()

                const dataCountBan = await countAccBan()

                const dataCountReportPending = await countReportPending()

                const dataAcc = await get5accNew()

                const dataBlog = await get5Blogs()

                if (dataCountAcc.success && dataCountBlogs.success && dataCountBan.success && dataCountReportPending.success && dataAcc.success && dataBlog.success) {
                    const acc = dataCountAcc.data.total

                    const blog = dataCountBlogs.data.total

                    const ban = dataCountBan.data.total

                    const report = dataCountReportPending.data.total

                    setCountAcc(acc)
                    setCountBlog(blog)
                    setCountBan(ban)
                    setCountReport(report)
                    setAccount(dataAcc.data)
                    setBlog(dataBlog.data)
                }
            } catch (err) {
                console.log('err count info', err)
            }

        }
        fetchCount()
    }, [])

    return (
        <div>
            <BreadcrumbAdmin />

            <Carousel className="flex w-full justify-between px-8 py-4" >
                <CarouselContent>
                    <CarouselItem>
                        <Card className='p-2 '>
                            <CardContent className="flex items-center justify-center w-[250px] h-[200px] ">
                                <div className="text-center space-y-2">
                                    <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                                        Tổng số người dùng
                                    </span>
                                    <p className="text-3xl font-bold text-gray-900">{countAcc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                </CarouselContent>

                <CarouselContent>
                    <CarouselItem>
                        <Card className='p-2'>
                            <CardContent className="flex items-center justify-center w-[250px] h-[200px] ">
                                <div className="text-center space-y-2">
                                    <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                                        Tổng số bài viết
                                    </span>
                                    <p className="text-3xl font-bold text-gray-900">{countBlog}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                </CarouselContent>

                <CarouselContent>
                    <CarouselItem>
                        <Card className='p-2'>
                            <CardContent className="flex items-center justify-center w-[250px] h-[200px] ">
                                <div className="text-center space-y-2">
                                    <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                                        Reports chưa xử lý
                                    </span>
                                    <p className="text-3xl font-bold text-gray-900">{countReport}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                </CarouselContent>
                <CarouselContent>
                    <CarouselItem>
                        <Card className='p-2'>
                            <CardContent className="flex items-center justify-center w-[250px] h-[200px] ">
                                <div className="text-center space-y-2">
                                    <span className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                                        Tài khoản bị khóa
                                    </span>
                                    <p className="text-3xl font-bold text-gray-900">{countBan}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                </CarouselContent>
            </Carousel>

            <div>
                <div className='flex justify-around pr-4 items-baseline'>
                    <h2 className="px-2 py-2 text-lg font-medium text-gray-700">Tài khoản mới gần đây</h2>

                    <a
                        href="/admin/user"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                        Xem tất cả
                    </a>
                </div>


                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Id</TableHead>
                            <TableHead className="w-[300px]">Usename / Email</TableHead>
                            <TableHead className="w-[150px]">Vai trò</TableHead>
                            <TableHead className="w-[250px]">Thời gian tạo</TableHead>
                            <TableHead className="w-[120px]">Trạng thái</TableHead>
                            <TableHead className="w-[100px] text-center">Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    {account.length !== 0 ? <TableBody>
                        {account.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell className="font-medium">{a.id}</TableCell>
                                <TableCell> {a.username} <br />
                                    <span className="italic">{a.email}</span>
                                </TableCell>

                                <TableCell>
                                    {a.roleId === 1 ? 'Admin' : 'Khách'}
                                </TableCell>

                                <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    <span className={cn('px-2 py-1 rounded-full text-sm font-medium', a.isActive === true ? "bg-green-100 text-green-700" : " bg-red-100 text-red-700")}>

                                        {a.isActive ? "Hoạt động" : "Không hoạt động"}
                                    </span>
                                </TableCell>

                                <TableCell className="text-right">

                                    {a.roleId === 1 ? ('') : (
                                        <ToggleGroup type="multiple">
                                            {a.isActive === true ?
                                                <ToggleGroupItem
                                                    value="ban"
                                                    aria-label="Toggle ban"
                                                    className="data-[state=on]:bg-red-100 data-[state=on]:text-red-600"
                                                >
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <span ><Ban /></span>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Bạn có chắc chắn muốn cấm tài khoản này?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Vui lòng xác nhận để tiếp tục hành động!
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleBan(a.id)}>
                                                                    Cấm
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </ToggleGroupItem>
                                                :
                                                <ToggleGroupItem
                                                    value="unlock"
                                                    aria-label="Toggle unlock"
                                                    className="data-[state=on]:bg-green-100 data-[state=on]:text-green-600"
                                                >
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <span><Unlock /></span>
                                                        </AlertDialogTrigger>

                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Bạn có chắc chắn muốn mở khóa tài khoản này?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Vui lòng xác nhận để tiếp tục hành động!
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>

                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleUnBan(a.id)}>Mở khóa</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </ToggleGroupItem>
                                            }

                                            <ToggleGroupItem
                                                value="resetpass"
                                                aria-label="Toggle reset password"
                                                className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-600"
                                            >
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <span ><KeyRound /></span>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Bạn có chắc chắn muốn đặt lại mật khẩu tài khoản này?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Vui lòng xác nhận để tiếp tục hành động!
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleResetPass(a.id)}>Đặt lại mật khẩu</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </ToggleGroupItem>

                                        </ToggleGroup>

                                    )
                                    }

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody> : ''}

                </Table>
            </div>

            <div>
                <div className='flex justify-around pr-4 items-baseline'>
                    <h2 className="px-2 py-2 text-lg font-medium text-gray-700">Bài viết mới gần đây</h2>

                    <a
                        href="/admin/blog"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                        Xem tất cả
                    </a>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Id</TableHead>
                            <TableHead className="w-[300px]">Nội dung</TableHead>
                            <TableHead className="w-[150px]">Người đăng tải</TableHead>
                            <TableHead className="w-[250px]">Ngày đăng</TableHead>
                            <TableHead className="w-[120px]">Trạng thái</TableHead>
                            <TableHead className="w-[100px] text-center">Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    {blog.map((b) => (
                        <TableBody key={b.id}>
                            <TableRow >
                                <TableCell className="font-medium"> {b.id}</TableCell>
                                <TableCell className='line-clamp-1'>
                                    {b.text}
                                </TableCell>

                                <TableCell className='font-bold italic'>
                                    {b.username}
                                </TableCell>

                                <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>

                                <TableCell className={cn('inline-flex px-5 py-1 rounded-full text-sm font-medium items-center', b.isDeleted === false ? " bg-green-100 text-green-700" : " bg-red-100 text-red-700")}>
                                    {b.isDeleted === false ? 'Public' : 'Private'}
                                </TableCell>

                                <TableCell className="text-right">
                                    <ToggleGroup type="multiple" variant="outline" size="sm">
                                        {b.isDeleted === false ? (
                                            <ToggleGroupItem
                                                value="hiden"
                                                aria-label="Toggle hiden"
                                                className="data-[state=on]:bg-red-100 data-[state=on]:text-red-600"
                                            >
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <span ><Lock /></span>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Bạn có chắc chắn muốn ẩn bài viết này?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Vui lòng xác nhận để tiếp tục hành động!
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleHiden(b.id)}>
                                                                Ẩn
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </ToggleGroupItem>) : (
                                            <ToggleGroupItem
                                                value="public"
                                                aria-label="Toggle public"
                                                className="data-[state=on]:bg-red-100 data-[state=on]:text-red-600"
                                            >
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <span ><Globe /></span>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Bạn có chắc chắn muốn ẩn bài viết này?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Vui lòng xác nhận để tiếp tục hành động!
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handlePublic(b.id)}>
                                                                Công khai
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </ToggleGroupItem>
                                        )}




                                        {/* <ToggleGroupItem
                                        value="view-detail"
                                        aria-label="View detail"
                                        className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-600"
                                    >
                                        <Eye />
                                    </ToggleGroupItem> */}

                                    </ToggleGroup>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ))}


                </Table>
            </div>
        </div>
    )
}
