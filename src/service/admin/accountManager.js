"use server"

const { connectDB } = require("@/config/db")

const pool = await connectDB()

const getAllUser = async () => {

    try {
        const result = await pool.request()
            .query('select a.id, a.email, a.username, a.roleid, a.isActive, a.createdAt from Account a')
            // console.log(result)
        return {
            success: true,
            data: result.recordset
        }
    } catch (err) {
        console.log("error get info all account", err)
        return (null)
    }
}

export { getAllUser }