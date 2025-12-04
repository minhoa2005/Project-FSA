'use server'

import { connectDB } from "@/config/db";

const pool = await connectDB()

export const countAccount = async () => {
    const result = await pool.request()
        .query('select count(*) as total from account')

    // console.log(result.recordset[0])
    return {
        success: true,
        data: result.recordset[0]
    }
}

export const countBlogs = async () => {
    const result = await pool.request()
        .query('select count(*) as total from blogs')

    // console.log(result.recordset[0])
    return {
        success: true,
        data: result.recordset[0]
    }
}


export const countAccBan = async () => {
    const result = await pool.request()
        .query('select count(*) as total from Account where isActive = 0')

    // console.log(result.recordset[0])
    return {
        success: true,
        data: result.recordset[0]
    }
}

export const get5accNew = async () => {
    const result = await pool.request()
        .query('select top 5 a.id, a.email, a.username,r.roleId, a.isActive, a.createdAt from Account a join AccountRole r on r.accountId=a.id WHERE r.roleId <> 1 order by createdAt desc')

    return {
        success: true,
        data: result.recordset
    }
}

export const countReportPending = async () => {
    const result = await pool.request()
        .query("select count(*) as total from Reports where status = 'Pending'")

    // console.log(result.recordset[0])
    return {
        success: true,
        data: result.recordset[0]
    }
}

export const get5Blogs = async () => {
    const result = await pool.request()
        .query('select top 5 b.id, b.text, a.username ,b.isDeleted, b.createdAt, b.updatedAt  from Blogs b join Account a on a.id = b.creatorId order by b.updatedAt desc')
    return {
        success: true,
        data: result.recordset
    }
}

export const get5Report = async () => {
    const result = await pool.request()
    . query('select top 5 id, blogId, reason, status, createdAt from Reports order by createdAt desc')
    return {
        success: true,
        data: result.recordset
    }
}