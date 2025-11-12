"use server"

import bcrypt from "bcryptjs";
// import { connectDB, sql } from "@/config/db";
import sql from "@/config/postgres";
import { deleteCookie, deleteCustomCookie, getCookie, getCustomCookie, setCookie, setCustomCookie } from "@/config/cookie";
import { optionalToken, signToken, verifyToken } from "@/config/jwt";
import { sendOTP } from "@/config/emailService";


const handleLogin = async (data) => {
    const email = data.get('email');
    const password = data.get('password');

    try {
        const result = await sql`
            SELECT
                a.id,
                a.email,
                a.username,
                a.password,
                a.isactive,
                r.rolename AS role
            FROM
                account AS a
            JOIN
                accountrole AS ar ON a.id = ar.accountid
            JOIN
                role AS r ON ar.roleid = r.id
            WHERE
                a.email = ${email}
        `;
        if (result.length === 0) {
            return { success: false, message: "Invalid email or password" };
        }
        const accountRecord = result[0];
        const user = {
            id: accountRecord.id,
            email: accountRecord.email,
            username: accountRecord.username,
            role: accountRecord.role,
            isActive: accountRecord.isactive
        };
        const hashedPassword = accountRecord.password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
            return { success: false, message: "Invalid email or password" };
        }
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            isActive: user.isactive
        }

        const token = signToken(payload);
        await setCookie(token);

        return { success: true, message: "Login successful", user };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Login failed" };
    }
}

const handleRegister = async (data) => {
    const email = data.get('email');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const fullName = data.get('fullName');
    const username = data.get('username');

    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const result = await sql.begin(async (tx) => {
            const [existingAccount] = await tx`
                SELECT id FROM account WHERE email = ${email}
            `;

            if (existingAccount) {
                throw new Error("Email already exists");
            }

            const [account] = await tx`
                INSERT INTO account (email, username, password, roleid)
                VALUES (${email}, ${username}, ${hashedPassword}, 2)
                RETURNING id
            `;

            await tx`
                INSERT INTO accountrole (accountid, roleid)
                VALUES (${account.id}, 2)
            `;

            await tx`
                INSERT INTO userprofile (accountid, fullname)
                VALUES (${account.id}, ${fullName})
            `;

            return { success: true, message: "Registration successful" };
        });

        return result;

    } catch (error) {
        console.error('Registration error:', error);

        if (error.message === "Email already exists") {
            return { success: false, message: error.message };
        }

        return { success: false, message: "Registration failed" };
    }
};

const logout = async () => {
    await deleteCustomCookie('recovery_data');
};

const authMe = async () => {
    const token = await getCookie();
    const decodedToken = verifyToken(token);
    console.log('Decoded Token:', decodedToken);
    if (decodedToken) {
        return {
            success: true,
            data: {
                id: decodedToken.id,
                email: decodedToken.email,
                username: decodedToken.username,
                role: decodedToken.role,
                isactive: decodedToken.isactive
            }
        };
    } else {
        return { success: false, message: "Unauthorized" };
    }
};

const sendOTPWithEmail = async (data) => {
    const email = data.get('email');
    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const checkEmail = await sql`
            SELECT id FROM account WHERE email = ${email}
        `;
        if (checkEmail.length === 0) {
            return { success: false, message: "Email does not exist" };
        }
        const userId = checkEmail[0].id;

        const checkOtp = await sql`
            SELECT * FROM otp 
            WHERE otp = ${otp} AND expireat > now() AND used = false
            ORDER BY createdat DESC
            LIMIT 1
        `;
        if (checkOtp.length > 0) {
            otp = otp - 1 || otp + 1;
        }

        const limiter = new Date(Date.now() - 2 * 60 * 1000);
        const limitOtp = await sql`
            SELECT * FROM otp
            WHERE createdat > ${limiter} AND used = false AND userid = ${userId}
            ORDER BY createdat DESC
            LIMIT 1
        `;
        if (limitOtp.length > 0) {
            return { success: false, message: 'Only 1 OTP for each 2 minutes' };
        }

        await sendOTP(email, otp);
        const expireTime = new Date(Date.now() + 5 * 60 * 1000);
        const createdAt = new Date();

        await sql`
            INSERT INTO otp (userid, otp, createdat, expireat)
            VALUES (${userId}, ${otp}, ${createdAt}, ${expireTime})
        `;

        const tempToken = optionalToken({ id: userId, otp }, '5m');
        await setCustomCookie('recovery_data', tempToken, { maxAge: 5 * 60 });

        return { userId, success: true, message: "OTP sent successfully" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to send OTP" };
    }
};

const verifyOTP = async (data) => {
    const otp = data.get('otp');
    const cookie = await getCustomCookie('recovery_data');
    if (!cookie) return { success: false, message: "OTP expired" };

    const decoded = verifyToken(cookie);
    if (!decoded) return { success: false, message: "Invalid OTP token" };

    if (decoded.otp !== otp) return { success: false, message: "Invalid OTP" };

    const time = new Date();

    const updateOtp = await sql`
        UPDATE otp
        SET used = true
        WHERE otp = ${otp} AND userid = ${decoded.id} AND expireat > ${time} AND used = false
        RETURNING *
    `;

    if (updateOtp.length === 0) {
        return { success: false, message: "OTP is already used or expired" };
    }

    const newToken = optionalToken({ id: decoded.id, otp: decoded.otp, verified: true }, '5m');
    await setCustomCookie('recovery_data', newToken, { maxAge: 5 * 60 });

    return { success: true, message: "OTP verified successfully" };
};

const resetPassword = async (data) => {
    const newPassword = data.get('password');
    const cookie = await getCustomCookie('recovery_data');
    if (!cookie) return { success: false, message: "Recovery session expired" };

    const decoded = verifyToken(cookie);
    if (!decoded) return { success: false, message: "Invalid recovery token" };
    if (!decoded.verified) return { success: false, message: "OTP not verified" };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    try {
        const updatedPassword = await sql`
            UPDATE account
            SET password = ${hashedPassword}
            WHERE id = ${decoded.id}
            RETURNING *
        `;
        if (updatedPassword.length > 0) {
            await deleteCustomCookie('recovery_data');
            return { success: true, message: "Password reset successfully" };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: "Failed to reset password" };
    }
};

export { handleLogin, handleRegister, authMe, logout, sendOTPWithEmail, verifyOTP, resetPassword };