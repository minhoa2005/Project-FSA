import VerifyOTPForm from '@/components/auth/recovery/VerifyOTPForm'
import React from 'react'
import { verifyOTP } from '@/service/public/auth/auth'
import { getCustomCookie } from '@/config/cookie'
import { redirect } from 'next/navigation';

export default async function page() {
  const cookie = await getCustomCookie('recovery_data');
  if (!cookie) {
    redirect('/recovery');
  }

  return (
    <div>
      <VerifyOTPForm submit={verifyOTP} />
    </div>
  )
}
