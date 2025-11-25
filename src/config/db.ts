import { config } from "@/types/config/dbTypes";
import sql from "mssql";

const dbConfig: config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        trustServerCertificate: true,
        encrypt: false,
    }
}

let pool: sql.ConnectionPool | null = null;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
            console.log('Database Connected')
        }
        return pool;
    }
    catch (error) {
        console.log('Database connection error: ', error);
    }
}

connectDB();

export { sql, connectDB };