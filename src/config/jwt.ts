import { optionalPayloadType, payloadType } from "@/types/config/tokenTypes";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";


const secret: string | undefined = process.env.JWT_SECRET || "default_secret_key" as string;

const signToken = (payload: payloadType) => {
    return jwt.sign(payload, secret, { expiresIn: "7d" });
};

const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};

const optionalToken = (payload: optionalPayloadType, expiresIn: StringValue | number = "7d") => {
    return jwt.sign(payload, secret, { expiresIn: expiresIn })
};

export { signToken, verifyToken, optionalToken };