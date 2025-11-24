type config = {
    user: string;
    password: string;
    server: string,
    database: string,
    options: {
        trustServerCertificate: boolean,
        encrypt: boolean,
    }
}

export type { config };