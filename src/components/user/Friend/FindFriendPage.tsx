"use client"
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Loader2 } from "lucide-react";
import { getInvitesReceived, acceptInvite, cancelInvite } from "@/service/users/friend";
import { getInitials } from "@/lib/formatter";
import Link from "next/link";

type InviteItem = {
    senderId: number;
    username: string;
    fullName?: string;
    imgUrl?: string;
    followAt?: string;
};

export default function FindFriendPage({ currentUserId }: { currentUserId?: number }) {
    const [invites, setInvites] = useState<InviteItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadInvites = async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            const res = await getInvitesReceived(currentUserId);
            setInvites(res?.data ?? []);
        } catch (err: any) {
            setError(err?.message ?? "Lỗi mạng");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (senderId: number) => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            await acceptInvite(currentUserId, senderId);
            setInvites(prev => prev.filter(i => i.senderId !== senderId));
        } catch (err: any) {
            setError(err?.message ?? "Lỗi khi chấp nhận");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (senderId: number) => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            await cancelInvite(currentUserId, senderId);
            setInvites(prev => prev.filter(i => i.senderId !== senderId));
        } catch (err: any) {
            setError(err?.message ?? "Lỗi khi huỷ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    return (
        <div className="p-3 w-[70%] mx-auto">
            <div className="mb-4 mt-5">
                <h2 className="text-xl font-semibold text-center">Lời mời kết bạn</h2>
            </div>

            {error && <div className="text-sm text-destructive mb-2">{error}</div>}

            <div className="space-y-3">
                {invites.map(i => (
                    <Card key={i.senderId} className="p-3 flex items-center justify-between">
                        <Link href={`/personal/${i.senderId}`} className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={i.imgUrl} />
                                <AvatarFallback>{getInitials(i.username)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{i.fullName ?? i.username}</div>
                                <div className="text-sm text-muted-foreground">@{i.username}</div>
                                {i.followAt && <div className="text-sm text-muted-foreground">Yêu cầu lúc: {new Date(i.followAt).toLocaleString()}</div>}
                            </div>
                        </Link>
                        <div className="flex gap-2">
                            <Button onClick={() => handleAccept(i.senderId)} disabled={loading} className="cursor-pointer">
                                <Check className="mr-2 h-4 w-4" />Chấp nhận
                            </Button>
                            <Button variant="outline" onClick={() => handleCancel(i.senderId)} disabled={loading} className="cursor-pointer" >
                                <X className="mr-2 h-4 w-4" />Huỷ
                            </Button>
                        </div>
                    </Card>
                ))}

                {invites.length === 0 && !loading && <div className="text-sm text-muted-foreground text-center">Không có lời mời</div>}

                {loading && invites.length === 0 && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
