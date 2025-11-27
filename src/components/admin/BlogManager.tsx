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
import { Ban } from 'lucide-react'
import { getAllBlog } from '@/service/admin/blogManager'

interface blog {
    id: number,
    text: string,
    username: string,
    createdAt: string,
    isDelete: boolean
}
export default function BlogManager() {
    const [blog, setBlog] = useState<blog[]>([])

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
                        <TableHead className="w-[250px]">Ngày đăng</TableHead>
                        <TableHead className="w-[120px]">Trạng thái</TableHead>
                        <TableHead className="w-[100px] text-center">Hành Động</TableHead>
                    </TableRow>
                </TableHeader>
                {blog.map((b) => (
                    <TableBody key={b.id}>
                        <TableRow >
                            <TableCell className="font-medium"> {b.id}</TableCell>
                            <TableCell>
                                {b.text}
                            </TableCell>

                            <TableCell>
                                {b.username}
                            </TableCell>

                            <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>

                            <TableCell>
                                {b.isDelete === true ? 'Private':'Public'}
                            </TableCell>

                            <TableCell className="text-right">

                                <ToggleGroup type="multiple" variant="outline" size="sm">
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
                                                    <AlertDialogAction>
                                                        Cấm
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </ToggleGroupItem>

                                </ToggleGroup>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                ))}


            </Table>
        </div>
    )
}
