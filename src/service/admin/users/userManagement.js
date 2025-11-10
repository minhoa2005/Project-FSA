"use server"

import { sql, connectDB } from "@/config/db"

const pool = await connectDB();

const getAllUsers = async () => {
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

export { getAllUsers, getUserById }