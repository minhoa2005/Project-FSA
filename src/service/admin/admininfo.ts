"use server"

import bcrypt from "bcryptjs";
import { request } from "http";

const { default: unauthorized } = require("@/app/unauthorized");
const { getCookie } = require("@/config/cookie");
const { connectDB } = require("@/config/db");
const { verifyToken } = require("@/config/jwt");

const pool = await connectDB();

const verifyAdmin = async () => {
    const token = await getCookie();
    const verifyAdmin = verifyToken(token);
    // console.log(verifyAdmin.role)

    if (!verifyAdmin || verifyAdmin.role !== 'Admin') {
        return false;
    }

    return true;
}

const getAdminInfo = async () => {
    if (!await verifyAdmin()) {
        unauthorized();
    }

    try {
        const result = await pool.request()
            .query("select u.accountId, a.email, a.password, u.fullName, u.phoneNumber, u.dob, u.imgUrl, u.createdAt, u.updatedAt from AdminProfile u join Account a on a.id = u.id")

        console.log(result)
        return {
            success: true,
            data: result.recordset[0]
        }

    } catch (err) {
        console.log("err get info admin", err)
        return (null)
    }
}

export const changePassAdmin = async (newPass) => {
    const salt = await bcrypt.genSalt(10)
    const hashPass = await bcrypt.hash(newPass, salt)

    const result = await pool.request()
    .input('pass', hashPass)
    .query('update account set password = @pass where id = 1')

    return result
}

export { getAdminInfo, verifyAdmin };