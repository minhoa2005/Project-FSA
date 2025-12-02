import { Button } from '@/components/ui/button'
import React from 'react'

export default function FollowButton({ id, className }: { id: number, className?: string }) {
    return (
        <Button className={className}>
            Theo dõi
        </Button>
    )
}
