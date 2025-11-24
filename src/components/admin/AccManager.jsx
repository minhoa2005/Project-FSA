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
import { filterAcc, getAllUser } from "@/service/admin/accountManager";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Ban, BookmarkIcon, Container, HeartIcon, KeyRound, Search, SlashIcon, StarIcon, Unlock } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { toast } from "sonner";

export function AccManager() {
    const [account, setAccount] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAccount = async () => {

            if (!search) {
                const res = await getAllUser();
                setAccount(res.data)
                return;
            }

            if (search && account.length === 0) {
                toast("Không có kết quả phù hợp")
                return;
            }

            // console.log("all acc:", res.data)
            const result = await filterAcc(search)
            setAccount(result.data)
        }
        fetchAccount()
    }, [search])
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
                        <BreadcrumbPage className={'font-medium'}>Danh sách người dùng</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="grid w-full max-w-sm gap-6">
                <InputGroup>
                    <InputGroupInput placeholder="Tìm kiếm theo tên đăng nhập..." onChange={(e) => setSearch(e.target.value)} />
                    <InputGroupAddon >
                        <Search />
                    </InputGroupAddon>
                </InputGroup>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead className="w-[300px]">Usename / Email</TableHead>
                        <TableHead className="w-[150px]">Vai trò</TableHead>
                        <TableHead className="w-[350px]">Thời gian tạo</TableHead>
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
                                {a.roleid === 1 ? 'Admin' : 'Khách'}
                            </TableCell>

                            <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <span className={cn('px-2 py-1 rounded-full text-sm font-medium', a.isActive === true ? "bg-green-100 text-green-700" : " bg-red-100 text-red-700")}>

                                    {a.isActive ? "Hoạt động" : "Không hoạt động"}
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
                </TableBody> : ''}

            </Table>
            {account.length === 0 ? '' :
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
