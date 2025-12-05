"use client"
import { Button } from '@/components/ui/button'
import { acceptInvite, cancelInvite, getStatusFriend, removeFriend, sendInvite } from '@/service/users/friend'
import { Minus, Plus, X } from 'lucide-react';
import React, { useEffect, useEffectEvent, useState } from 'react'

export default function FollowButton({ id, className, watcherId }: { id: number, className?: string, watcherId: number }) {
    const [status, setStatus] = useState<number>(0);
    const getStatus = useEffectEvent(async () => {
        try {
            const response = await getStatusFriend(watcherId, id);
            setStatus(response.data);
            console.log("Status friend:", response.data);
        } catch (error) {
            console.log("getStatus error", error);
        }
    })
    const handleOnClick = async () => {
        try {
            if (status === 0) {
                await sendInvite(id, watcherId);
                setStatus(1);
            }
            if (status === 1) {
                await cancelInvite(id, watcherId);
                setStatus(0);
            }
            if (status === 2) {
                await removeFriend(id, watcherId);
                setStatus(0);
            }
            if (status === 3) {
                await acceptInvite(watcherId, id);
                setStatus(2)
            }
        }
        catch (error) {
            console.log("handleSendRequest error", error);
        }
    }
    useEffect(() => {
        getStatus();
    }, [id, watcherId])
    return (
        <Button
            onClick={(e) => {
                e.stopPropagation(),
                    handleOnClick()
            }}
            variant='outline'
            className={`${className} ${status === 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : status === 1 ? null : 'bg-red-500 text-white hover:bg-red-600'}`}
        >
            {status === 0 ? (<><Plus /> Kết bạn</>) : status === 1 ? (<><X /> Huỷ lời mời</>) : status === 2 ? (<><Minus /> Huỷ Kết Bạn</>) : (<><Plus /> Chấp nhận</>)}
        </Button>
    )
}
