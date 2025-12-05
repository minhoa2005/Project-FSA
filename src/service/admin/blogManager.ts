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

export const hidenBlog = async (id: number) => {
    try {
        const result = await pool.request()
            .input('id', id)
            .query(`update blogs set isDeleted = 1 where id = @id`)

        return result
    } catch (err) {
        console.log('err hiden blog be', err)
    }
}

export const publicBlog = async (id: number) => {
    try {
        const result = await pool.request()
            .input('id', id)
            .query(`update blogs set isDeleted = 0 where id = @id`)
        return result
    } catch (err) {
        console.log('err public blog fe', err)
    }
}

export const searchBlog = async (keyword: string) => {
    const result = await pool.request()
        .input('key', `%${keyword}%`)
        .query(`select b.id, b.text, a.username ,b.isDeleted, b.createdAt, b.updatedAt  from Blogs b 
join Account a on a.id = b.creatorId
where b.id like @key`)
    return {
        success: true,
        data: result.recordset
    }
}