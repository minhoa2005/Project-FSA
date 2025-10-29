import { connectDB } from "../config/db";

let pool;
connectDB().then((p) => pool = p).catch((err) => console.log('Error connecting to DB pool: ', err));
console.log(pool);
export async function GET(req) {
    try {
        const result = await pool.request().query('SELECT * FROM [User]');
        return new Response(JSON.stringify(result.recordset), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.log('Error fetching patients: ', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}