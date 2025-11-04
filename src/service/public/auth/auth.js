"use server"

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB, sql } from "@/config/db";
import { cookies } from "next/headers";
import { cookieName, getCookie, setCookie } from "@/config/cookie";
import { signToken, verifyToken } from "@/config/jwt";
import { sign } from "jsonwebtoken";

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
        await setCookie(cookieName, token);
        return { success: true, message: "Login successful" };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Login failed" };
    }
    console.log(email, password)
}

const handleRegister = async (data) => {
    const email = data.get('email');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
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
        if (result.rowsAffected[0] > 0 && updateRoleResult.rowsAffected[0] > 0) {
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

const authMe = async () => {
    const token = getCookie();
    const decodedToken = verifyToken(token);
    if (decodedToken) {
        return { success: true, data: decodedToken };
    } else {
        return { success: false, message: "Unauthorized" };
    }
}

export { handleLogin, handleRegister, authMe }