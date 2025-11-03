import jwt from "jsonwebtoken";


const secret = process.env.JWT_SECRET;

const signToken = (payload) => {
    return jwt.sign(payload, secret, { expiresIn: "7d" });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};

const optionalToken = (payload, expiresIn = "7d") => {
    return jwt.sign(payload, secret, { expiresIn: expiresIn })
};

export { signToken, verifyToken, optionalToken };