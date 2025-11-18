import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

export default function InfoSection({ className }) {
    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle className='text-2xl'>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className=''>
                    <Label>Full Name</Label>
                    <Input type="text" placeholder="Minh Nguyen" className="mt-1 mb-4" />
                </div>
                <div>
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="" className="mt-1 mb-4" />
                </div>
                <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" placeholder="" className="mt-1 mb-4" />
                </div>
                <div>
                    <Label>Date of Birth</Label>
                    <Input type="date" placeholder="" className="mt-1 mb-4" />
                </div>
            </CardContent>
            <CardFooter className='flex justify-end' >
                <Button className='cursor-pointer'>Update Information</Button>
            </CardFooter>
        </Card>
    )
}
