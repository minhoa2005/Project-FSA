"use server"

import { getCookie } from "@/config/cookie";
import { sql, connectDB } from "@/config/db"
import { verifyToken } from "@/config/jwt";
import bcrypt from "bcryptjs";
import { unauthorized } from "next/navigation";


const pool = await connectDB();


const verifyAdmin = async () => {
    const token = await getCookie();
    const verifyUser = verifyToken(token);
    if (!verifyUser || verifyUser.role !== 'Admin') {
        console.log(1)
        return false;
    }
    return true;
}

const getAllUsers = async () => {
    if (!await verifyAdmin()) {
        unauthorized();
    }
    try {
        const result = await pool.request().query(
            `select a.id, a.email, r.roleName as role, a.isActive from Account a join AccountRole ar on a.id = ar.accountId join Role r on ar.roleId = r.id`
        );
        console.log(result.recordset);
        if (result.recordset.length === 0) {
            return {
                success: false,
                message: "No users found"
            };
        }
        return {
            success: true,
            data: result.recordset
        };
    } catch (error) {
        return {
            success: false,
            message: "Error fetching users"
        }
    }
}

const getUserById = async (userId) => {
    if (!await verifyAdmin()) {
        unauthorized();
    }
    try {
        const result = await pool.request().input('id', userId).query(
            `
            select a.id, a.email, r.roleName as role, a.isActive from Account a join AccountRole ar on a.id = ar.accountId join Role r on ar.roleId = r.id where a.id = @id
            `
        )
        if (result.recordset.length === 0) {
            return {
                success: false,
                message: "User not found"
            }
        }
        return {
            success: true,
            data: result.recordset[0]
        }
    }
    catch (error) {
        console.error('Error fetching user by ID:', error);
        return {
            success: false,
            message: "Error fetching user"
        }
    }
}

const disableUser = async (data) => {
    if (!await verifyAdmin()) {
        unauthorized();
    }
    try {
        const { id, isActive } = data;
        if (isActive) {
            const result = await pool.request().input('id', id).query(
                `
                update Account set isActive = 0 where id = @id
                `
            );
            return {
                success: true,
                message: "User disabled successfully"
            }
        }
        else {
            const result = await pool.request().input('id', id).query(
                `
                update Account set isActive = 1 where id = @id
                `
            );
            return {
                success: true,
                message: "User enabled successfully"
            }
        }
    }
    catch (error) {
        console.error('Error disabling/enabling user:', error);
        return {
            success: false,
            message: "Error disabling/enabling user"
        }
    }
}

const resetPassword = async (userId) => {
    if (!await verifyAdmin()) {
        unauthorized();
    }

}
export { getAllUsers, getUserById, disableUser }