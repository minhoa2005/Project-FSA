"use server"

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB } from "@/config/db";
import { cookies } from "next/headers";
import { cookieName, getCookie } from "@/config/cookie";
import { verifyToken } from "@/config/jwt";

const pool = await connectDB();

const handleLogin = async (data) => {

    const email = data.get('email');
    const password = data.get('password');
    console.log(email, password)
    redirect('/');
}

const handleRegister = async (data) => {
    const email = data.get('email');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const transaction = new sql.transaction(pool);
    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        await transaction.begin();
        const result = await pool.request().input('email', email).input('password', hashedPassword).query(
            `INSERT INTO Account (email, password, roleId) values(@{email}, @{password}, 2)`
        );
        const updateRoleResult = await pool.request().input('email', email).query(
            `INSERT INTO AccountRole(accountId, roleId) VALUES((SELECT id FROM Account WHERE email = @{email}), 2)`
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