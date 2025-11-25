"use server"
import mail from "nodemailer";

const transporter = mail.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendOTP = async (to: string, otp: string) => {
    const mailOptions = {
        from: "BlogG",
        to: to,
        subject: "Your OTP Code",
        html:
            `
            <div style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 600px;
                margin: 40px auto;
                background-color: #e6f7ff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            ">
                <h2 style="color: #333;">Here is your OTP code</h2>
                <div style="
                    background-color: #fff;
                    padding: 20px;
                    text-align: center;
                    border: 2px dashed #007bff;
                    margin: 20px 0;
                    border-radius: 5px;
                ">
                    <h1 style="font-size: 2.5em; color: #007bff;">${otp}</h1>
                    <p style="text-align: center; color: #555;">
                    Please verify your email to complete the signup process.<br />
                    This OTP is valid for <b>5 minutes</b>.
                </p>
                </div>
            </div>
        `
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP email sent to:", to);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
}

const sendAccCreateByAdminToCus = async (to: string, password: string) => {
    const mailOptions = {
        from: "BlogG",
        to: to,
        subject: "BlogG: Tài khoản của bạn đã được tạo thành công!",
        html:
            `
            <div style="font-family: Arial, sans-serif; background:#f4f7fb; padding:20px;">
            <div style="
                max-width:600px;
                margin:0 auto;
                background:#ffffff;
                border-radius:8px;
                padding:25px;
                box-shadow:0 4px 12px rgba(0,0,0,0.08);
                border:1px solid #e6e6e6;
            ">
                <h2 style="color:#1a1a1a; text-align:center; margin-top:0;">
                    🎉 Tài khoản BlogG đã sẵn sàng!
                </h2>

                <p style="color:#444; font-size:14px;">
                    Xin chào,
                    <br/>Tài khoản của bạn đã được tạo thành công. Đây là thông tin đăng nhập của bạn:
                </p>

                <div style="
                    background:#f0f8ff;
                    padding:20px;
                    border-radius:6px;
                    border-left:5px solid #007bff;
                    margin:20px 0;
                ">
                    <p style="margin:0; font-size:15px; color:#333;">
                        <b>Email:</b> ${to}
                    </p>
                    <p style="margin:0; font-size:15px; color:#333;">
                        <b>Password:</b> ${password}
                    </p>
                </div>

                <p style="color:#555; font-size:13px; text-align:center;">
                    Vì lý do bảo mật, vui lòng đổi mật khẩu sau khi đăng nhập.
                </p>

            </div>
        </div>
        `
    }
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending account by admin:", error);
    }
}

const sendNewPassword = async (to: string, pass: string) => {
    const mailOptions = {
        from: "BlogG",
        to: to,
        subject: "Your New Password",
        html:
            `
            <div style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 600px;
                margin: 40px auto;
                background-color: #e6f7ff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            ">
                <h2 style="color: #333;">Here is your new password</h2>
                <div style="
                    background-color: #fff;
                    padding: 20px;
                    text-align: center;
                    border: 2px dashed #007bff;
                    margin: 20px 0;
                    border-radius: 5px;
                ">
                    <h1 style="font-size: 2.5em; color: #007bff;">${pass}</h1>
                    <p style="text-align: center; color: #555;">
                    Please use this password to log in and remember to change it after logging in.<br />
                    For security reasons, consider changing your password regularly.
                </p>
                </div>
            </div>
        `
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP email sent to:", to);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
}

export { sendOTP, sendNewPassword, sendAccCreateByAdminToCus };