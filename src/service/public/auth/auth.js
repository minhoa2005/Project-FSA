"use server"

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB, sql } from "@/config/db";
import { cookies } from "next/headers";
import { cookieName, deleteCookie, deleteCustomCookie, getCookie, getCustomCookie, setCookie, setCustomCookie } from "@/config/cookie";
import { optionalToken, signToken, verifyToken } from "@/config/jwt";
import { sign } from "jsonwebtoken";
import { sendOTP } from "@/config/emailService";

const pool = await connectDB();

const handleLogin = async (data) => {

    const email = data.get('email');
    const password = data.get('password');
    try {
        const result = await pool.request().input('email', email).query(
            `SELECT
    A.id,
    A.email,
    A.password,
    R.roleName AS role
FROM
    Account AS A
JOIN
    AccountRole AS AR ON A.id = AR.accountId 
JOIN
    Role AS R ON AR.roleId = R.id 
WHERE
    A.email = @email `
        );
        if (result.recordset.length === 0) {
            return { success: false, message: "Invalid email or password" };
        }
        const user = result.recordset[0];
        console.log(user);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: "Invalid email or password" };
        }
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        const token = signToken(payload);
        await setCookie(token);
        return { success: true, message: "Login successful", user };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Login failed" };
    }
}

const handleRegister = async (data) => {
    const email = data.get('email');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const fullName = data.get('fullName');
    const transaction = new sql.Transaction(pool);
    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        await transaction.begin();
        const checkEmail = await pool.request().input('email', email).query(
            `SELECT * FROM Account WHERE email = @email`
        );
        if (checkEmail.recordset.length > 0) {
            await transaction.rollback();
            return { success: false, message: "Email already exists" };
        }
        const result = await pool.request().input('email', email).input('password', hashedPassword).query(
            `INSERT INTO Account (email, password, roleId) values(@email, @password, 2)`
        );
        const updateRoleResult = await pool.request().input('email', email).query(
            `INSERT INTO AccountRole(accountId, roleId) VALUES((SELECT id FROM Account WHERE email = @email), 2)`
        );
        const addUserProfileResult = await pool.request().input('email', email).input('fullName', fullName).query(
            `INSERT INTO UserProfile(accountId, fullName) VALUES((SELECT id FROM Account WHERE email = @email), @fullName)`
        );
        if (result.rowsAffected[0] > 0 && updateRoleResult.rowsAffected[0] > 0 && addUserProfileResult.rowsAffected[0] > 0) {
            await transaction.commit();
            return { success: true, message: "Registration successful" };
        } else {
            await transaction.rollback();
            return { success: false, message: "Registration failed" };
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        return { success: false, message: "Registration failed" };
    }
}

const logout = async () => {
    await deleteCookie();
}

const authMe = async () => {
    const token = await getCookie();
    console.log("Token in authMe:", token);
    const decodedToken = verifyToken(token);
    console.log("Decoded Token in authMe:", decodedToken);
    if (decodedToken) {
        return {
            success: true, data: {
                id: decodedToken.id,
                email: decodedToken.email,
                role: decodedToken.role
            }
        };
    } else {
        return { success: false, message: "Unauthorized" };
    }
}

const sendOTPWithEmail = async (data) => {
    const email = data.get('email');
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const checkEmail = await pool.request().input('email', email).query(
            `
            Select id from Account where email = @email
            `
        );
        if (checkEmail.recordset.length <= 0) {
            return {
                success: false,
                message: "Email does not exist"
            }
        }
        const userId = checkEmail.recordset[0].id;
        const checkOtp = await pool.request().query(`select top 1 * from OTP where otp = ${otp} and expireAt > GETDATE() and used = 0 order by createdAt DESC`);
        if (checkOtp.recordset.length > 0) {
            otp = otp - 1 || otp + 1
        }
        const limiter = new Date(Date.now() - 2 * 60 * 1000);
        const limitOtp = await pool.request().input("time", limiter).input('userId', userId).query(`select top 1 * from OTP where createdAt > @time and used = 0 and userId = @userId order by createdAt DESC`);
        if (limitOtp.recordset.length > 0) {
            return {
                success: false,
                message: 'Only 1 OTP for each 2 minutes'
            }
        }
        await sendOTP(email, otp);
        const expireTime = new Date(Date.now() + 5 * 60 * 1000);
        const createdAt = new Date(Date.now());
        const saveOtp = await pool.request().input('userId', userId).input('otp', otp).input('createdAt', createdAt).input('expireAt', expireTime).query(
            `
            INSERT INTO Otp (userId, otp, createdAt, expireAt) VALUES (@userId, @otp, @createdAt, @expireAt)
            `
        );
        const tempToken = optionalToken({ id: userId, otp }, '5m');
        await setCustomCookie('recovery_data', tempToken, { maxAge: 5 * 60 });
        return {
            userId: userId,
            success: true,
            message: "OTP sent successfully",
        }
    }
    catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Failed to send OTP"
        }
    }
};

const verifyOTP = async (data) => {
    const otp = data.get('otp');
    const cookie = await getCustomCookie('recovery_data');
    if (!cookie) {
        return {
            success: false,
            message: "OTP expired"
        }
    }
    const decoded = verifyToken(cookie);
    if (!decoded) {
        return {
            success: false,
            message: "Invalid OTP token"
        }
    }
    if (decoded.otp !== otp) {
        return {
            success: false,
            message: "Invalid OTP"
        }
    }
    const time = new Date(Date.now());
    const updateOtp = await pool.request().input('otp', otp).input('userId', decoded.id).input('time', time).query(
        `
        UPDATE OTP SET used = 1 WHERE otp = @otp AND userId = @userId AND expireAt > @time AND used = 0
        `
    );
    if (updateOtp.rowsAffected[0] <= 0) {
        return {
            success: false,
            message: "OTP is already used or expired"
        }
    }
    const newToken = optionalToken({ id: decoded.id, otp: decoded.otp, verified: true }, '5m');
    await setCustomCookie('recovery_data', newToken, { maxAge: 5 * 60 });
    return {
        success: true,
        message: "OTP verified successfully"
    }
}

const resetPassword = async (data) => {
    const newPassword = data.get('password');
    const cookie = await getCustomCookie(`recovery_data`);
    if (!cookie) {
        return {
            success: false,
            message: "Recovery session expired"
        }
    }
    const decoded = verifyToken(cookie);
    if (!decoded) {
        return {
            success: false,
            message: "Invalid recovery token"
        }
    }
    if (!decoded.verified) {
        return {
            success: false,
            message: "OTP not verified"
        }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    try {
        const updatedPassword = await pool.request().input('userId', decoded.id).input('password', hashedPassword).query(
            `
            update Account set password = @password where id = @userId
            `
        );
        console.log(updatedPassword.rowsAffected[0][0]);
        if (updatedPassword.rowsAffected[0] > 0) {
            await deleteCustomCookie('recovery_data');
            return {
                success: true,
                message: "Password reset successfully"
            }
        }
    }
    catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Failed to reset password"
        }
    }
}

export { handleLogin, handleRegister, authMe, logout, sendOTPWithEmail, verifyOTP, resetPassword };