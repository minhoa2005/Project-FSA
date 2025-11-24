"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPersonalInfo } from '@/service/users/personalInfo'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function InfoSection({ className }) {
    const [fetching, setFetching] = useState(false);
    const [data, setData] = useState(null);
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

        }
        catch (error) {

        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchInfo();
    }, [])
    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle className='text-2xl'>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className=''>
                    <Label>Full Name</Label>
                    <Input
                        placeholder={data?.fullName ? '' : 'Not provided'}
                        type="text"
                        value={data?.fullName}
                        onChange={(e) => setData((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="mt-1 mb-4" />
                </div>
                <div>
                    <Label>Email Address</Label>
                    <Input
                        placeholder={data?.email ? '' : 'Not provided'}
                        type="email"
                        value={data?.email}
                        onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                        className="mt-1 mb-4" />
                </div>
                <div>
                    <Label>Phone Number</Label>
                    <Input
                        placeholder={data?.phoneNumber ? '' : 'Not provided'}
                        type="tel"
                        value={data?.phoneNumber}
                        onChange={(e) => setData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        className="mt-1 mb-4" />
                </div>
                <div>
                    <Label>Date of Birth</Label>
                    <Input
                        type="date"
                        value={data?.dob ? new Date(data.dob).toISOString().split('T')[0] : ''}
                        onChange={(e) => setData((prev) => ({ ...prev, dob: e.target.value }))}
                        className="mt-1 mb-4" />
                </div>
            </CardContent>
            <CardFooter className='flex justify-end' >
                <Button className='cursor-pointer'>Update Information</Button>
            </CardFooter>
        </Card>
    )
}
