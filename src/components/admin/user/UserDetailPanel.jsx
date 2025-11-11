import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/formatter';
import { getUserById } from '@/service/admin/users/userManagement'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner';

export default function UserDetailPanel({ setSelectedUser, userData }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dob, setDob] = useState('');

    const fetchUserData = useCallback(async (id) => {
        try {
            setLoading(true);
            const response = await getUserById(id);
            setData(response.data);
            console.log(response.data);
            setFullName(response.data?.fullName || '');
            setPhoneNumber(response.data?.phoneNumber || '');
            setDob(response.data?.dob || '');
        }
        catch (error) {
            toast.error('Failed to fetch user. Please try again later.', { duration: 4000 });
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveEdit = async () => {
        const saveData = {
            ...data,
            fullName,
            phoneNumber,
            dob
        }
        setData(saveData);
        console.log('Saved data:', saveData);

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
                                    <Input value={fullName || ''} onChange={(e) => setFullName(e.target.value)} disabled={checkPermission(data?.role)} />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>Phone Number</Label>
                                    <Input value={phoneNumber || ''} onChange={(e) => setPhoneNumber(e.target.value)} disabled={checkPermission(data?.role)} />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>Date of Birth</Label>
                                    <Input type={'date'} value={dob ? new Date(dob).toISOString().split('T')[0] : ''} onChange={(e) => { setDob(e.target.value) }} disabled={checkPermission(data?.role)} />
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className='flex justify-center gap-2'>
                            <Button variant="outline" disabled={!userData || checkPermission(data?.role)} onClick={saveEdit}>Save Changes</Button>
                            <Button variant="outline" disabled={!userData || checkPermission(data?.role)}>Reset Password</Button>
                            <Button variant="outline" disabled={!userData || checkPermission(data?.role)}>Disable</Button>
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
