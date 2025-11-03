"use server"

import { redirect } from "next/navigation";

const handleLogin = async (data) => {
    try {
        const email = data.get('email');
        const password = data.get('password');
        console.log(email, password)
        redirect('/');
    }

    catch (error) {

    }

}

const handleRegister = async () => {

}

export { handleLogin }