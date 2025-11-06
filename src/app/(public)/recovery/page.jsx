import GetOTPForm from '@/components/auth/recovery/GetOTPForm'
import { sendOTPWithEmail } from '@/service/public/auth/auth'

export default async function page() {

    return (
        <div>
            <GetOTPForm submit={sendOTPWithEmail} />
        </div>
    )
}
