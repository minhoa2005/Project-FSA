"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPersonalInfo, updateInfo } from '@/service/users/personalInfo'
import React, { use, useEffect, useState } from 'react'
import { toast } from 'sonner'
import InfoSectionSkeleton from './InfoSectionSkeleton'
import { useRouter } from 'next/navigation'


export default function InfoSection({ className }: {
    className?: string,
}) {
    const router = useRouter()
    const [fetching, setFetching] = useState(false);
    const [data, setData] = useState({} as { fullName: string, email: string, phoneNumber?: string, dob?: string });
    const [loading, setLoading] = useState(false);
    const fetchInfo = async () => {
        setFetching(true);
        try {
            const response = await getPersonalInfo();
            if (response.success) {
                setData(response.data);
            }
            else {
                toast.error(response.message || "Failed to fetch personal information.", { duration: 4000 });
            }
        }
        catch (error) {
            console.error("Error fetching personal info:", error);
            toast.error("Failed to fetch personal information.", { duration: 4000 });
        }
        finally {
            setFetching(false);
        }
    }
    const handleUpdate = async () => {
        setLoading(true);
        try {
            const response = await updateInfo(data);
            if (response.success) {
                toast.success("Personal information updated successfully.", { duration: 4000 });
                router.refresh()
            }
            else {
                toast.error(response.message || "Failed to update personal information.", { duration: 4000 });
            }
        }
        catch (error) {
            console.error("Error updating personal info:", error);
            toast.error("Failed to update personal information.", { duration: 4000 });
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchInfo();
    }, [])

    return (
        fetching ? (
            <InfoSectionSkeleton />
        ) : (
            <Card className={`${className}`}>
                <CardHeader>
                    <CardTitle className='text-2xl'>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className=''>
                        <Label>Họ và tên</Label>
                        <Input
                            placeholder={data?.fullName ? '' : 'Chưa cung cấp'}
                            type="text"
                            value={data?.fullName || ''}
                            onChange={(e) => setData((prev) => ({ ...prev, fullName: e.target.value }))}
                            className="mt-1 mb-4" />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            placeholder={data?.email ? '' : 'Chưa cung cấp'}
                            type="email"
                            value={data?.email || ''}
                            onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                            className="mt-1 mb-4" />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input
                            placeholder={data?.phoneNumber ? '' : 'Chưa cung cấp'}
                            type="tel"
                            value={data?.phoneNumber || ''}
                            onChange={(e) => setData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                            className="mt-1 mb-4" />
                    </div>
                    <div>
                        <Label>Ngày sinh</Label>
                        <Input
                            type="date"
                            value={data?.dob ? new Date(data.dob).toISOString().split('T')[0] : ''}
                            onChange={(e) => setData((prev) => ({ ...prev, dob: e.target.value }))}
                            className="mt-1 mb-4" />
                    </div>
                </CardContent>
                <CardFooter className='flex justify-end' >
                    <Button className='cursor-pointer' onClick={() => handleUpdate()} disabled={loading}>Cập Nhật</Button>
                </CardFooter>
            </Card >
        )
    )
}
