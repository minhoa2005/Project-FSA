import React, { useEffect, useState } from 'react'
import BreadcrumbAdmin from './Breadcrumb'
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
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Ban, Eye, EyeClosed, EyeOff, Globe, Lock, ShieldOff, UserMinus } from 'lucide-react'
import { getAllBlog, hidenBlog, publicBlog } from '@/service/admin/blogManager'
import { toast } from 'sonner'

interface blog {
    id: number,
    text: string,
    username: string,
    createdAt: string,
    isDeleted: boolean
}
export default function BlogManager() {
    const [blog, setBlog] = useState<blog[]>([])

    const handleHiden = async (id: number) => {
        try {
            const res = await hidenBlog(id)
            // console.log(id)
            if (res) {
                const data = await getAllBlog()
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
                const data = await getAllBlog()
                setBlog(data.data)

                toast.success('Hiện bài viết thành công')
            } else {
                toast.error('Lỗi hiện bài viết')
            }
        } catch (err) {
            console.log('Err public blog fe', err)
        }
    }

    const fetchBlog = async () => {
        try {
            const res = await getAllBlog()
            if (res.success) {
                // console.log(res.data)
                setBlog(res.data)
            }
        } catch (err) {
            console.log('err get blog fe', err)
        }
    }
    useEffect(() => {
        fetchBlog()
    }, [])
    return (
        <div>
            <BreadcrumbAdmin></BreadcrumbAdmin>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead className="w-[300px]">Nội dung</TableHead>
                        <TableHead className="w-[150px]">Người đăng tải</TableHead>
                        <TableHead className="w-[125px]">Ngày đăng</TableHead>
                        <TableHead className="w-[150px]">Trạng thái</TableHead>
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
    )
}
