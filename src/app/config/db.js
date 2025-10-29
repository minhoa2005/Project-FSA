import sql from "mssql";

const dbConfig = {
    user: 'sa',
    password: '123',
    server: 'localhost',
    database: 'Hospital_Project',
    options: {
        trustServerCertificate: true,
        encrypt: false,
    }
}

let pool;

const connectDB = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
        }
        return pool;
    }
    catch (error) {
        console.log('Database connection error: ', error);
    }
}

export { sql, connectDB };