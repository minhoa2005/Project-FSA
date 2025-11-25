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

const getAllAccBan = async () => {
    try {
        const result = await pool.request()
            .query('select a.id, a.email, a.username, a.roleid, a.isActive, a.createdAt from Account a where isActive = 0')

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
        .query(`select a.id, a.email, a.username, u.fullName, u.phoneNumber, u.dob, u.imgUrl, a.createdAt, a.updatedAt, a.isActive
            from Account a
            LEFT join UserProfile u on u.id = a.id
            LEFT join AdminProfile ad on ad.id = a.id
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



export { getAllUser, filterAcc, banAcc, unBanAcc, getAllAccBan }
