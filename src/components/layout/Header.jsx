import Image from 'next/image'
import React from 'react'

export default function Header() {
    return (
        <div>
            <div>
                <Image src="/logo.png" alt="Logo" width={120} height={40} />
            </div>
        </div>
    )
}
