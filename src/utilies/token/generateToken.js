import jwt from "jsonwebtoken";

export const generateToken = ({payload = {},signture,expiresIn = {}})=>{
    return jwt.sign(payload,signture,expiresIn);
}