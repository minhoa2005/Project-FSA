"use client"

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { disableUser, getAllUsers, resetAccountPassword } from '@/service/admin/users/userManagement'
import { ChevronRight } from 'lucide-react'
import React, { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import UserDetailPanel from './UserDetailPanel'
import { useRouter } from 'next/navigation'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import UserListSkeleton from './UserListSkeleton'
import { debounce } from '@/lib/function'

export default function UserList({ className }) {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [totalPerPage, setTotalPerPage] = useState('5');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
    const [disableLoading, setDisableLoading] = useState(false);
    const getUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            setData(response.data);
        }
        catch (error) {
            toast.error('Failed to fetch users. Please try again later.', { duration: 4000 });
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateIsActive = (id) => {
        setData(data.map(user => {
            if (user.id === id) {
                return { ...user, isActive: !user.isActive };
            }
            return user;
        }));
    }

    const disableAccount = async (id, isActive) => {
        try {
            const funcData = {
                id: id,
                isActive: isActive
            }
            setDisableLoading(true);
            const response = await disableUser(funcData);
            if (response.success) {
                toast.success('Operation successfully.', { duration: 4000 });
                updateIsActive(id, isActive);
            } else {
                toast.error(response.message, { duration: 4000 });
            }
            // setData(data.map(user => {
            //     if (user.id === id) {
            //         return {
            //             ...user,
            //             isActive: !isActive
            //         }
            //     }
            //     return user;
            // }))
            // await getUsers();
        } catch (error) {
            toast.error('Failed to disable user. Please try again later.', { duration: 4000 });
            console.error('Error disabling user:', error);
        } finally {
            setDisableLoading(false);
        }
    }

    const handleChangePage = async () => {
        const info = {
            currentPage: currentPage,
            totalPerPage: totalPerPage,
            filter: filter,
            search: search
        }
        try {
            setLoading(true);
            const response = await getAllUsers(info);
            console.log(response.total)
            if (response.success) {
                setData(response.data);
                setTotalPage(Math.ceil(parseInt(response.total) / parseInt(totalPerPage)));
            }
        }
        catch (error) {
            toast.error('Failed to fetch users. Please try again later.', { duration: 4000 });
            console.error('Error fetching users:', error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleFilter = async () => {
        setCurrentPage(1);
        const info = {
            currentPage: 1,
            totalPerPage: totalPerPage,
            filter: filter,
            search: search
        }
        try {
            setLoading(true);
            const response = await getAllUsers(info);
            if (response.success) {
                setData(response.data);
                setTotalPage(Math.ceil(response.data.length / totalPerPage));
            }
        }
        catch (error) {
            toast.error('Failed to fetch users. Please try again later.', { duration: 4000 });
            console.error('Error fetching users:', error);
        }
        finally {
            setLoading(false);
        }
        console.log("Filter changed:", filter, search);
    }

    const debouncedSearch = debounce(setSearch, 500);

    const handleResetPassword = async (id) => {
        console.log('Reset password for user ID:', id);
        setResetPasswordLoading(true);
        try {
            const response = await resetAccountPassword(id);
            if (response.success) {
                toast.success('Password reset successfully. The new password has been sent to the user\'s email.', { duration: 4000 });
            } else {
                toast.error(response.message, { duration: 4000 });
            }
        }
        catch (error) {
            toast.error('Failed to reset password. Please try again later.', { duration: 4000 });
            console.error('Error resetting password:', error);
        }
        finally {
            setResetPasswordLoading(false);
        }

    }

    useEffect(() => {
        handleFilter();
    }, [filter, search]);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    useEffect(() => {
        handleChangePage();
    }, [currentPage, totalPerPage]);

    return (
        <div className={`p-3 ${className} flex flex-row gap-2`}>
            <div className='flex-1'>
                <div className='flex flex-row justify-between mb-2'>
                    <Input placeholder="Search users..." className="w-[50%]" onChange={(e) => debouncedSearch(e.target.value)} />
                    <Select onValueChange={setFilter} value={filter}>
                        <SelectTrigger className="w-[20%]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                {loading ? (
                    <UserListSkeleton />
                ) : (
                    <Suspense fallback={<UserListSkeleton />}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Is Active</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data || []).map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/50 cursor-pointer"
                                        onClick={() => setSelectedUser({ userId: user.id, userRole: user.role })}
                                    >
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                                        <TableCell>
                                            {user.role !== 'Admin' && (
                                                <DropdownMenu >
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant={'ghost'}>
                                                            Action
                                                            <ChevronRight />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" side="right">
                                                        <DropdownMenuItem
                                                            disabled={resetPasswordLoading}
                                                            onClick={() => handleResetPassword(user.id)}
                                                        >
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            disabled={disableLoading}
                                                            onClick={() => disableAccount(user.id, user.isActive)}
                                                        >
                                                            {user.isActive ? 'Disable' : 'Enable'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Suspense>
                )}
                <div>
                    <Select onValueChange={setTotalPerPage} value={totalPerPage}>
                        <SelectTrigger className="w-[20%] mt-4">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {['5', '10', '15', '20'].map((num) => (
                                    <SelectItem key={num} value={num}>{num} per page</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Pagination className="mt-4 float-right">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>

                            {currentPage > 2 && (
                                <>
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(1)}
                                            isActive={currentPage === 1}
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                    {currentPage > 3 && <PaginationEllipsis />}
                                </>
                            )}


                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        {currentPage - 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}


                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => setCurrentPage(currentPage)}
                                    isActive={true}
                                >
                                    {currentPage}
                                </PaginationLink>
                            </PaginationItem>


                            {currentPage < totalPage && (
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        {currentPage + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}


                            {currentPage < totalPage - 1 && (
                                <>
                                    {currentPage < totalPage - 2 && <PaginationEllipsis />}
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(totalPage)}
                                            isActive={currentPage === totalPage}
                                        >
                                            {totalPage}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => currentPage < totalPage && setCurrentPage(currentPage + 1)}
                                    className={currentPage === totalPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
            <Separator orientation='vertical' />
            <div className='w-[40%]'>
                <UserDetailPanel userData={selectedUser} setSelectedUser={setSelectedUser} updateIsActive={updateIsActive} />
            </div>
        </div >
    )
}
