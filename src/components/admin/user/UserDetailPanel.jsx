import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/formatter';
import { disableUser, getUserById } from '@/service/admin/users/userManagement'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner';

export default function UserDetailPanel({ setSelectedUser, userData, updateIsActive }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [disableLoading, setDisableLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const fetchUserData = useCallback(async (id) => {
        try {
            setLoading(true);
            const response = await getUserById(id);
            setData(response.data);
            setIsActive(response.data.isActive);
        }
        catch (error) {
            toast.error('Failed to fetch user. Please try again later.', { duration: 4000 });
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    }, []);



    const disableAccount = async () => {
        try {
            const funcData = {
                id: data.id,
                isActive: isActive
            }
            setDisableLoading(true);
            const response = await disableUser(funcData);
            if (!response.success) {
                toast.error(response.message, { duration: 4000 });
            }
            else {
                setIsActive(!isActive);
                updateIsActive(data.id);
                toast.success('User disabled successfully.', { duration: 4000 });
            }
        } catch (error) {
            toast.error('Failed to disable user. Please try again later.', { duration: 4000 });
            console.error('Error disabling user:', error);
        } finally {
            setDisableLoading(false);
        }
    }

    useEffect(() => {
        if (userData) {
            fetchUserData(userData);
        }
    }, [userData, fetchUserData]);

    const checkPermission = (userRole) => {

        if (userRole === 'Admin') {

            return true;
        }
        return false;
    }
    return (
        <div>
            <Card className="w-full min-h-[500px] flex flex-col">
                <CardHeader>
                    <CardTitle className='text-center text-2xl'>Detail</CardTitle>
                </CardHeader>
                {userData?.userId ? (
                    <>
                        <CardContent className='flex-1'>

                            <div className='flex flex-col gap-4'>
                                <div className='grid gap-2'>
                                    <Label>User ID</Label>
                                    <Input value={data?.id || ''} disabled />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>Full Name</Label>
                                    <Input value={data?.fullName || ''} disabled />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>Phone Number</Label>
                                    <Input value={data?.phoneNumber || ''} disabled />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>Date of Birth</Label>
                                    <Input type={'date'} value={data?.dob ? new Date(data.dob).toISOString().split('T')[0] : ''} disabled />
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className='flex justify-center gap-2'>
                            <Button variant="outline" disabled={!userData || checkPermission(data?.role)}>Reset Password</Button>
                            <Button
                                variant="outline"
                                disabled={!userData || checkPermission(data?.role) || disableLoading}
                                onClick={() => disableAccount()}
                            >
                                {isActive ? 'Disable' : 'Enable'}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
                        </CardFooter>
                    </>
                ) : (
                    <div className='flex justify-center items-center h-full'>
                        <p>Select a user to see details</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
