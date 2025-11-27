"use server"

import { connectDB } from "@/config/db"

const pool = await connectDB()

export const getAllBlog = async () => {
    try {
        const result = await pool.request()
            .query('select b.id, b.text, a.username ,b.isDeleted, b.createdAt, b.updatedAt  from Blogs b join Account a on a.id = b.creatorId')
        // console.log(result.recordset)
            return {
                success: true,
                data: result.recordset
            }
    } catch (err) {
        console.log('err get all blog', err)
    }
}