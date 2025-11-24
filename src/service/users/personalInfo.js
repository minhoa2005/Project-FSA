"use server"
import { unauthorized } from "next/navigation";
import { connectDB } from "@/config/db";
import { getCookie } from "@/config/cookie";
import { verifyToken } from "@/config/jwt";
import bcrypt from 'bcryptjs';

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
        const salt = await bcrypt.genSalt(10);
        const newPassHash = await bcrypt.hash(newPassword, salt);
        const checkOldPass = await pool.request().input('id', id).query(`select password from Account where id = @id`);
        const isMatch = await bcrypt.compare(oldPassword, checkOldPass.recordset[0].password);
        if (!isMatch) {
            return {
                success: false,
                message: "Mật khẩu cũ không đúng"
            }
        }
        const result = await pool.request().input('id', id).input('oldPassword', oldPassword).input('newPassword', newPassHash).query(`
            update Account
            set password = @newPassword
            where id = @id
            `);
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                message: "Đã có lỗi xảy ra"
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
            message: "Đã có lỗi xảy ra"
        }
    }
}
export { getPersonalInfo, updateInfo, changePassword, verifyUser };