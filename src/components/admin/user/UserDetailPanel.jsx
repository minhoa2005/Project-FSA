import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserById } from '@/service/admin/users/userManagement'
import React, { useCallback, useEffect, useState } from 'react'

export default function UserDetailPanel({ userId, setSelectedUserId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUserData = useCallback(async (id) => {
        try {
            setLoading(true);
            const response = await getUserById(id);
            setData(response.data);
        }
        catch (error) {
            toast.error('Failed to fetch user. Please try again later.', { duration: 4000 });
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchUserData(userId);
        }
    }, [userId, fetchUserData])
    return (
        <div>
            <Card className="w-full min-h-[500px] flex flex-col">
                <CardHeader>
                    <CardTitle className='text-center text-2xl'>Detail</CardTitle>
                </CardHeader>
                {userId ? (
                    <>
                        <CardContent className='flex-1'>

                            <div className='flex flex-col gap-4'>
                                <div className='grid gap-2'>
                                    <Label>User ID</Label>
                                    <Input value={data?.id || ''} disabled />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>Email</Label>
                                    <Input value={data?.email || ''} disabled />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>Role</Label>
                                    <Input value={data?.role || ''} disabled />
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className='flex justify-center gap-2'>
                            <Button variant="outline" disabled={!userId}>Save Changes</Button>
                            <Button variant="outline" disabled={!userId}>Reset Password</Button>
                            <Button variant="outline" disabled={!userId}>Disable</Button>
                            <Button variant="outline" onClick={() => setSelectedUserId(null)}>Cancel</Button>
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
