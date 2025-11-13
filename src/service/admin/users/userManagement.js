"use server"

import { getCookie } from "@/config/cookie";
import { sql, connectDB } from "@/config/db"
import { sendNewPassword } from "@/config/emailService";
import { verifyToken } from "@/config/jwt";
import { randomPassword } from "@/lib/function";
import bcrypt from "bcryptjs";
import { Int, NVarChar } from "mssql";
import { unauthorized } from "next/navigation";


const pool = await connectDB();


const verifyAdmin = async () => {
    const token = await getCookie();
    const verifyUser = verifyToken(token);
    if (!verifyUser || verifyUser.role !== 'Admin') {
        // console.log(1)
        return false;
    }
    return true;
}

const getAllUsers = async (data = {}) => {
    if (!await verifyAdmin()) {
        unauthorized();
    }
    try {
        const { currentPage = 1, totalPerPage = 5, filter = 'all', search = '' } = data;
        const offset = (currentPage - 1) * totalPerPage;
        const request = pool.request();
        request.input('offset', Int, offset);
        request.input('limit', Int, totalPerPage);
        request.input('search', NVarChar(100), `%${search || ''}%`);
        request.input('filter', NVarChar(50), filter || '');
        const totalData = await request.query(
            `select count(*) as total from Account a 
            join AccountRole ar on a.id = ar.accountId
            join Role r on ar.roleId = r.id
            where (@filter = 'all' or r.roleName = @filter)
            and (a.email like @search or a.id like @search)
            `
        );
        const result = await request.query(
            `select a.id, a.email, r.roleName as role, a.isActive from Account a 
            join AccountRole ar on a.id = ar.accountId 
            join Role r on ar.roleId = r.id
            where (@filter = 'all' or r.roleName = @filter)
            and (a.email like @search or a.id like @search)
            order by a.id asc
            offset @offset rows
            fetch next @limit rows only
            `
        );
        if (result.recordset.length === 0) {
            return {
                success: false,
                message: "No users found"
            };
        }
        return {
            success: true,
            data: result.recordset,
            total: totalData.recordset[0].total
        };
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching users"
        }
    }
}

const getUserById = async (userData) => {
    if (!await verifyAdmin()) {
        unauthorized();
    }
    try {
        const result = await pool.request().input('id', userData.userId).query(
            `
            select a.id, a.email, r.roleName as role, a.isActive, p.fullName, p.phoneNumber, p.dob from Account a
            join AccountRole ar on a.id = ar.accountId 
            join Role r on ar.roleId = r.id 
            join ${userData.userRole}Profile p on a.id = p.accountId
            where a.id = @id
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
        const checkUser = await pool.request().input('id', id).query(
            `
            select r.roleName
            from Account a
            join AccountRole ar on a.id = ar.accountId
            join Role r on ar.roleId = r.id
            where a.id = @id
            `
        )
        if (checkUser.recordset.length <= 0) {
            return {
                success: false,
                message: "User not found"
            }
        }
        if (checkUser.recordset[0].roleName === 'Admin') {
            return {
                success: false,
                message: "Cannot disable Admin user"
            }
        }
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

const resetAccountPassword = async (userId) => {
    console.log('Resetting password for user ID:', userId);
    if (!await verifyAdmin()) {
        unauthorized();
    }
    try {
        const user = await pool.request().input('id', userId).query(
            `
            select email from Account where id = @id
            `
        )
        if (user.recordset.length === 0) {
            return {
                success: false,
                message: "User not fount"
            }
        }
        const email = user.recordset[0].email;
        const newPassword = randomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
        const updated = await pool.request().input('id', userId).input('password', hashedPassword).query(
            `
            update Account set password = @password where id = @id
            `
        )
        if (updated.rowsAffected[0] >= 0) {
            await sendNewPassword(email, newPassword);
            return {
                success: true,
                message: "Password reset successfully",
            }
        }
    }
    catch (error) {
        console.error('Error resetting user password:', error);
        return {
            success: false,
            message: "Error resetting password"
        }
    }
}
export { getAllUsers, getUserById, disableUser, resetAccountPassword };