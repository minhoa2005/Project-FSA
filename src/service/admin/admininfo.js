"use server"

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
            .query("select u.accountId, u.fullName, u.phoneNumber, u.dob, u.imgUrl, u.createdAt, u.updatedAt from AdminProfile u")

            // console.log(result)
        return{
            success: true,
            data: result.recordset[0]
        }

    } catch (err) {
        console.log("err get info admin", err)
        return (null)
    }
}

export { getAdminInfo, verifyAdmin };