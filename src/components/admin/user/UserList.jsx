"use client"

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAllUsers } from '@/service/admin/users/userManagement'
import { ChevronRight } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import UserDetailPanel from './UserDetailPanel'
import { useRouter } from 'next/navigation'

export default function UserList({ className }) {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState('5');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const getUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            setData(response.data);
            console.log(response);
        }
        catch (error) {
            toast.error('Failed to fetch users. Please try again later.', { duration: 4000 });
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers])

    return (
        <div className={`p-3 ${className} flex flex-row gap-2`}>
            <div className='flex-1'>
                <div className='flex flex-row justify-between mb-2'>
                    <Input placeholder="Search users..." className="w-[50%]" />
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
                            <TableRow key={user.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                                <TableCell>
                                    <DropdownMenu >
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={'ghost'}>
                                                Action
                                                <ChevronRight />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" side="right">
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Disable</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div>
                    <Select onValueChange={setTotal} value={total}>
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
                </div>
            </div>
            <Separator orientation='vertical' />
            <div className='w-[40%]'>
                <UserDetailPanel userId={selectedUserId} setSelectedUserId={setSelectedUserId} />
            </div>
        </div>
    )
}
