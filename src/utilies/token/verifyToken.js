import jwt from "jsonwebtoken";

export const verifyToken = ({token,signture})=>{
    return jwt.verify(token,signture)
}