"use server"
import { randomPassword } from "@/lib/function";
import bcrypt from "bcryptjs";
const { connectDB } = require("@/config/db")

const pool = await connectDB()

const getAllUser = async () => {

    try {
        const result = await pool.request()
            .query('select a.id, a.email, a.username,r.roleId, a.isActive, a.createdAt from Account a join AccountRole r on r.accountId=a.id')
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

export const getEmailAccById = async (id) => {
    const result = await pool.request()
        .input('id', id)
        .query(`select * from account where id= @id`)
    // console.log(result.recordset[0])
    return result.recordset[0]
}

export const getAllEmail = async () => {
    try {
        const result = await pool.request()
            .query('select email from account')
        // console.log(result.recordset)
        return result.recordset

    } catch (err) {
        console.log('err get all email', err)
    }
}

export const getAllUsername = async () => {
    const result = await pool.request()
        .query('select username from account')
    console.log(result.recordset)
    return result.recordset;
}

export const addAccByAdmin = async (fullName, email, username, password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(password, salt)

        await pool.request()
            .input('email', email).input('username', username).input('password', hashPass)
            .query(`insert into account(email, username, password) values (@email, @username, @password)`)

        await pool.request()
            .input('email', email)
            .query(`insert into AccountRole(accountId, roleId) values((select id from account where email = @email), 2)`)

        await pool.request()
            .input('email', email)
            .input('fullName', fullName)
            .query(`insert into UserProfile(accountId, fullName) values ((select id from account where email = @email), @fullName)`)

        return {
            success: true
        }

    } catch (err) {
        console.log('Err add account by admin', err)
        return {
            success: false,
            error: err
        }
    }
}


const getAllAccBan = async () => {
    try {
        const result = await pool.request()
            .query('select a.id, a.email, a.username, r.roleid, a.isActive, a.createdAt from Account a  join AccountRole r on r.accountId=a.id where isActive = 0')

        return {
            success: true,
            data: result.recordset
        }
    } catch (err) {
        console.log('get all acc banj err', err)
    }
}

const filterAcc = async (keyword) => {
    const result = await pool.request()
        .input('key', `%${keyword}%`)
        .query(`select a.id, a.email, a.username, u.fullName, u.phoneNumber, u.dob, u.imgUrl, a.createdAt, a.updatedAt, a.isActive, r.roleId
            from Account a
            LEFT join UserProfile u on u.id = a.id
            LEFT join AdminProfile ad on ad.id = a.id
			Left join AccountRole r on r.accountId=a.id
            where username like @key`)
    return {
        success: true,
        data: result.recordset
    }
}

const banAcc = async (id) => {
    const result = await pool.request()
        .input("id", id)
        .query(`
                UPDATE Account
                SET isActive = 0
                WHERE id = @id
            `);

    return result;
};

const unBanAcc = async (id) => {
    const result = await pool.request()
        .input('id', id)
        .query(`Update account set isActive = 1 where id = @id`);
    return result;
}


export const resetPassByAdmin = async (id) => {

    const newPass = randomPassword();
    // console.log(newPass)

    const salt = await bcrypt.genSalt(10)
    const hashPass = await bcrypt.hash(newPass, salt)

    const result = await pool.request()
        .input('id', id).input('pass', hashPass)
        .query(`update account set password = @pass where id = @id`)
    return {
        success: result,
        newPass: newPass
    }
}


export { getAllUser, filterAcc, banAcc, unBanAcc, getAllAccBan }
