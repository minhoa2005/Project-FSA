import { cookies } from "next/headers";

const cookieName = process.env.COOKIE_NAME || "app_cookie";
const setting = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/"
}

const setCookie = async (value: string, options = {}) => {
    const cookie = await cookies();
    const cookieOptions = { ...setting, ...options };
    cookie.set(cookieName, value, cookieOptions);
}

const setCustomCookie = async (name: string, value: string, options = {}) => {
    const cookie = await cookies();
    const cookieOptions = { ...setting, ...options };
    cookie.set(name, value, cookieOptions);
}

const getCustomCookie = async (name: string) => {
    const cookie = await cookies();
    return cookie.get(name)?.value || null;
}

const deleteCustomCookie = async (name: string) => {
    const cookie = await cookies();
    cookie.delete(name, { path: "/" });
}

const getCookie = async () => {
    const cookie = await cookies();
    return cookie.get(cookieName)?.value || null;
}

const deleteCookie = async () => {
    const cookie = await cookies();
    cookie.delete(cookieName, { path: "/" });
}

export { setCookie, getCookie, deleteCookie, cookieName, setCustomCookie, getCustomCookie, deleteCustomCookie };