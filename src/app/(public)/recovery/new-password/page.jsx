import ResetPasswordForm from '@/components/auth/recovery/ResetPasswordForm'
import React from 'react'
import { resetPassword } from '@/service/public/auth/auth'
import { redirect } from 'next/navigation';
import { getCustomCookie } from '@/config/cookie';

export default async function page() {
  const cookie = await getCustomCookie('recovery_data');
  if (!cookie) {
    redirect('/login');
  }
  return (
    <div>
      <ResetPasswordForm submit={resetPassword} />
    </div>
  )
}
