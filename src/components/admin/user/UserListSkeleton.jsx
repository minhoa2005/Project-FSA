import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'

export default function UserListSkeleton() {
    return (
        <div className="p-3 space-y-4">
            {/* Table skeleton */}
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
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-[80%]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[90%]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[60%]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[40%]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[30%]" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
