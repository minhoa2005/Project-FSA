import mail from "nodemailer";

const transporter = mail.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const sendOTP = async (to, otp) => {
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

export { sendOTP };