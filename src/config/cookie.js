import { cookies } from "next/headers";

const cookieName = process.env.COOKIE_NAME || "app_cookie";
const setting = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
}

const setCookie = async (value, options = {}) => {
    const cookie = cookies();
    const cookieOptions = { ...setting, ...options };
    await cookie.set(cookieName, value, cookieOptions);
}

const getCookie = () => {
    const cookie = cookies();
    return cookie.get(cookieName)?.value || null;
}

const deleteCookie = async () => {
    const cookie = cookies();
    await cookie.delete(cookieName, { path: "/" });
}

export { setCookie, getCookie, deleteCookie, cookieName };