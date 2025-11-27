import { getAllAccBan, unBanAcc } from '@/service/admin/accountManager'
import React, { useEffect, useState } from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination'
import { Ban, KeyRound, SlashIcon, Unlock } from 'lucide-react'
import Link from "next/link"
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function AccBan() {
    const [acc, setAcc] = useState([])

    const handleUnBan = async (id) => {
        try {
            const res = await unBanAcc(id)
            if (res) {
                const fetchData = await getAllAccBan()
                setAcc(fetchData.data);
                toast.success('Mở khóa tài khoản thành công!')
            } else {
                toast.error("Lỗi mở khóa tài khoản")
            }
        } catch (err) {
            console.log(err)
            console.log("Lỗi mở khóa acc", err)
        }

    }

    const fetchAcc = async () => {
        try {
            const res = await getAllAccBan()
            if (res.success) {
                setAcc(res.data)
                console.log(res.data)
            } else {
                console.log("fetch all acc ban error!")
            }
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchAcc()
    }, [])
    return (
        <div className="bg-background">
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
                        <BreadcrumbPage className={'font-medium'}>Tài khoản bị khóa</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* <div className="grid w-full max-w-sm gap-6">
                <InputGroup>
                    <InputGroupInput placeholder="Tìm kiếm theo tên đăng nhập..." onChange={(e) => debouncedSearch(e.target.value)} />
                    <InputGroupAddon >
                        <Search />
                    </InputGroupAddon>
                </InputGroup>
            </div> */}
            {acc.length !== 0 ?
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
                    <TableBody>
                        {acc.map((a) => (
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

                                    <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm">
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
                                    </ToggleGroup>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
                : (<div className='text-center italic text-red-500 dark:text-red-300'>
                    Không có tài khoản nào bị cấm
                </div>)}

            {acc.length === 0 ? '' :
                <Pagination className='flex justify-end py-3'>
                    <PaginationContent >
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" >
                                2
                            </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            }
        </div >
    )
}
