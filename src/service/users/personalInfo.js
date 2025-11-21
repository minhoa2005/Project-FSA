"use server"
import { unauthorized } from "next/navigation";
import { connectDB } from "@/config/db";
import { getCookie } from "@/config/cookie";
import { verifyToken } from "@/config/jwt";

const pool = await connectDB();

const verifyUser = async () => {
    const token = await getCookie();
    const verifyUser = verifyToken(token);
    if (!verifyUser || verifyUser.role !== 'User') {
        return false;
    }
    return true;
};

const getPersonalInfo = async () => {
    if (!await verifyUser()) {
        unauthorized();
    }
    try {
        const token = await getCookie();
        const decoded = verifyToken(token);
        const id = decoded.id;
        const role = decoded.role;
        const result = await pool.request().input('id', id).query(
            `
            select a.email, p.fullName, p.phoneNumber, p.dob from Account a
            join AccountRole ar on a.id = ar.accountId 
            join Role r on ar.roleId = r.id 
            join ${role}Profile p on a.id = p.accountId
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
        console.error('Error fetching personal info:', error);
        return {
            success: false,
            message: "Error fetching personal info"
        }
    }
}

const updateInfo = async (data) => {
    if (!await verifyUser()) {
        unauthorized();
    }
    try {
        const { fullName, phoneNumber, dob } = data;
        const token = await getCookie();
        const decoded = verifyToken(token);
        const id = decoded.id;
        const result = await pool.request().input('id', id).input('fullName', fullName).input('phoneNumber', phoneNumber).input('dob', dob).query(`
            update UserProfile
            set fullName = @fullName, phoneNumber = @phoneNumber, dob = @dob
            where accountId = @id
            `);
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                message: "User not found"
            }
        }
        return {
            success: true
        }
    }
    catch (error) {
        console.error('Error updating personal info:', error);
        return {
            success: false,
            message: "Error updating personal info"
        }
    }
}

const changePassword = async (oldPassword, newPassword) => {
    if (!await verifyUser()) {
        unauthorized();
    }
    try {
        const token = await getCookie();
        const decoded = verifyToken(token);
        const id = decoded.id;
        const result = await pool.request().input('id', id).input('oldPassword', oldPassword).input('newPassword', newPassword).query(`
            update Account
            set password = @newPassword
            where id = @id and password = @oldPassword
            `);
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                message: "Old password is incorrect"
            }
        }
        return {
            success: true
        }
    }
    catch (error) {
        console.error('Error changing password:', error);
        return {
            success: false,
            message: "Error changing password"
        }
    }
}
export { getPersonalInfo, updateInfo, changePassword };