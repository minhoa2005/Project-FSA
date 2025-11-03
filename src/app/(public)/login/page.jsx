import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DivideCircle } from 'lucide-react'
import React from 'react'

export default function page() {
    return (
        <div className='flex items-center justify-center h-screen'>
            <div className='flex-1 flex flex-col items-center justify-center'>
                <h1 className='text-[100px]'>BlogG</h1>
                <p className='text-[20px]'>Share your moment</p>
            </div>
            <div className='flex-1 flex items-center justify-center'>
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle >Login to your account</CardTitle>
                        <CardDescription>Enter your email and password to login</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" required />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full">
                            Login
                        </Button>
                        <Button className="w-full" variant="outline">
                            Register
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
