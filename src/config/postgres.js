import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require', // Neon yêu cầu SSL
    max: 10, // Số kết nối tối đa
    idle_timeout: 20,
    connect_timeout: 10
});


export default sql;