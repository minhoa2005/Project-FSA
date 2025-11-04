

import { cookies } from "next/headers";

const cookieName = process.env.COOKIE_NAME || "app_cookie";
const setting = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
}

const setCookie = async (value, options = {}) => {
    const cookie = await cookies();
    const cookieOptions = { ...setting, ...options };
    cookie.set(cookieName, value, cookieOptions);
}

const getCookie = async () => {
    const cookie = await cookies();
    return cookie.get(cookieName)?.value || null;
}

const deleteCookie = async () => {
    const cookie = await cookies();
    cookie.delete(cookieName, { path: "/" });
}

export { setCookie, getCookie, deleteCookie, cookieName };