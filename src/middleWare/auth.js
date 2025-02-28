
import { userModel } from "../DB/models/user.model.js";
import { asyncHandler, verifyToken } from "../utilies/index.js";
export const tokenTypes = {
    access: "access",
    refresh: "refresh"
}
export const authentication = (tokenType = tokenTypes.access) => {
    return asyncHandler(async (req, res, next) => {
        const { token } = req.headers;
        if (!token) {
            return next(new Error("token not found ....", { cause: 401 }))
        }
        const [prefix, myToken] = token.split(" ") || [];
        if (!myToken || !prefix) {
            return next(new Error("token not found ....", { cause: 401 }))
        }
        let ACCESS_SIGNTURE = undefined;
        let REFRESH_SIGNTURE = undefined;
        if (prefix == "Admin") {
            ACCESS_SIGNTURE = process.env.ACCESS_TOKEN_SIGNTURE_ADMIN;
            REFRESH_SIGNTURE = process.env.REFRESH_TOKEN_SIGNTURE_ADMIN;
        }
        else if (prefix == "Bearer") {
            ACCESS_SIGNTURE = process.env.ACCESS_TOKEN_SIGNTURE_USER;
            REFRESH_SIGNTURE = process.env.REFRESH_TOKEN_SIGNTURE_USER;
        } else {
            return next(new Error("invalid token prefix", { cause: 401 }))
        }
        const decoded = verifyToken({ token: myToken, signture: tokenType == tokenTypes.access ? ACCESS_SIGNTURE : REFRESH_SIGNTURE })
        if (!decoded?.userId) {
            return next(new Error("invalid token payload", { cause: 403 }))
        }
        let user = await userModel.findOne({_id:decoded.userId,pannedAt:{ $exists: false }}).lean();
        if (!user) {
            return next(new Error("user not found or deleted", { cause: 404 }))
        }
        if (user?.isDeleted) {
            return next(new Error("you are deleted please active your acount", { cause: 403 }))
        }
        if ((user?.changeCredentialTime?.getTime() / 1000) > decoded?.iat) {
            return next(new Error("expire token please login again", { cause: 401 }))
        }
        req.user = user;
        next()
    })
}
export const graphAuthentication = async ({ token ,tokenType = tokenTypes.access}) => {
    const [prefix, myToken] = token.split(" ") || [];
    if (!myToken || !prefix) {
        throw next(new Error("token not found ....", { cause: 401 }))
    }
    let ACCESS_SIGNTURE = undefined;
    let REFRESH_SIGNTURE = undefined;
    if (prefix == "Admin") {
        ACCESS_SIGNTURE = process.env.ACCESS_TOKEN_SIGNTURE_ADMIN;
        REFRESH_SIGNTURE = process.env.REFRESH_TOKEN_SIGNTURE_ADMIN;
    }
    else if (prefix == "Bearer") {
        ACCESS_SIGNTURE = process.env.ACCESS_TOKEN_SIGNTURE_USER;
        REFRESH_SIGNTURE = process.env.REFRESH_TOKEN_SIGNTURE_USER;
    } else {
        throw new Error("invalid token prefix", { cause: 401 })
    }
    const decoded = verifyToken({ token: myToken, signture: tokenType == tokenTypes.access ? ACCESS_SIGNTURE : REFRESH_SIGNTURE })
    // const decoded = verifyToken({ token: token, signture: process.env.ACCESS_TOKEN_SIGNTURE_USER });
    if (!decoded?.userId) {
        throw new Error("invalid token payload", { cause: 403 })
    }
    let user = await userModel.findOne({_id:decoded.userId,pannedAt:{ $exists: false }}).lean();
    if (!user) {
        throw new Error("user not found ", { cause: 404 })
    }
    if (user?.isDeleted) {
        throw new Error("you are deleted please active your acount", { cause: 403 })
    }
    if ((user?.changeCredentialTime?.getTime() / 1000) > decoded?.iat) {
        throw new Error("expire token please login again", { cause: 401 })
    }
    return user;
};
export const authorization = (accessRole) => {
    return asyncHandler(async (req, res, next) => {
        if (!accessRole.includes(req.user.role)) {
            return next(new Error("Access denied or un authorized", { cause: 403 }))
        }
        next();
    })
}
