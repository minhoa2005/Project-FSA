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
import Link from "next/link"
import { getAllUser } from "@/service/admin/accountManager";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Ban, BookmarkIcon, Container, HeartIcon, KeyRound, SlashIcon, StarIcon, Unlock } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";

export function AccManager() {
    const [account, setAccount] = useState([]);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await getAllUser();
                console.log("all acc:", res.data)

                if (res.success) {
                    setAccount(res.data)
                }

            } catch (err) {
                console.log("fetch acc error", err)
            }
        }
        fetchAccount()
    }, [])
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
                    <BreadcrumbItem>
                        <BreadcrumbPage>Danh sách người dùng</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Usename</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Thời gian tạo</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-center">Hành Động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {account.map((a) => (
                        <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.id}</TableCell>
                            <TableCell>{a.email}</TableCell>
                            <TableCell>{a.username}</TableCell>

                            <TableCell>
                                {a.roleid === 1 ? 'Admin' : 'Khách'}
                            </TableCell>

                            <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-sm font-medium 
    ${a.isActive === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>

                                    {a.isActive === true ? "Hoạt động" : "Không hoạt động"}
                                </span>
                            </TableCell>

                            <TableCell className="text-right">

                                {a.roleid === 2 ?
                                    <ToggleGroup type="multiple" variant="outline" spacing={2} size="sm">
                                        {a.isActive = true ? <ToggleGroupItem
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
                                                        <AlertDialogAction>Cấm</AlertDialogAction>
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
                                                            <AlertDialogAction>Mở khóa</AlertDialogAction>
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
                                                        <AlertDialogAction>Đặt lại mật khẩu</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </ToggleGroupItem>

                                    </ToggleGroup>
                                    :
                                    ''
                                }


                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>

            </Table>
            <Pagination>
                <PaginationContent>
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
        </div>

    )
}
