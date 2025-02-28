import joi from "joi";
import { Types } from "mongoose";
import { seniorityLevelTypes } from "./enum.js";

const idValidation = (value, helper) => {
    const isValid = Types.ObjectId.isValid(value)
    return isValid ? value : helper.message(`invalid id : ${value}`)
}
export const genralRules = {
    email: joi.string().email({ tlds: { allow: true }, maxDomainSegments: 3 }).messages({ "string.email": "email must be a valid email" }),
    password: joi.string().regex(/^[a-zA-Z0-9]{8,30}$/),
    phone: joi.string().regex(/^(010|011|012|015)\d{8}$/),
    id: joi.string().custom(idValidation),
    headers: joi.object({
        token: joi.string().required(),
        'cache-control': joi.string(),
        'postman-token': joi.string(),
        'content-type': joi.string(),
        'content-length': joi.string(),
        host: joi.string(),
        'user-agent': joi.string(),
        accept: joi.string(),
        'accept-encoding': joi.string(),
        connection: joi.string(),
        "x-vercel-ip-country-region": joi.string(),
        "x-forwarded-proto": joi.string(),
        "x-forwarded-host": joi.string(),
        "x-vercel-ip-longitude": joi.string(),
        "x-vercel-ip-timezone": joi.string(),
        "x-vercel-ip-continent": joi.string(),
        "x-vercel-ip-city": joi.string(),
        "x-vercel-proxied-for": joi.string(),
        "forwarded": joi.string(),
        "x-vercel-deployment-url": joi.string(),
        "x-vercel-ja4-digest": joi.string(),
        "x-vercel-id": joi.string(),
        "x-forwarded-for": joi.string(),
        "x-vercel-forwarded-for": joi.string(),
        "x-vercel-ip-country": joi.string(),
        "x-real-ip": joi.string(),
        "x-vercel-internal-ingress-bucket": joi.string(),
        "x-vercel-proxy-signature": joi.string(),
        "x-vercel-proxy-signature-ts": joi.string(),
        "x-vercel-ip-as-number": joi.string(),
        "x-vercel-ip-latitude": joi.string(),
    }),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().valid("profilePic", "coverPic").messages({ "any.required": "file is required" }).required()
    }),
    companiesFile: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),   
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().valid("Logo", "coverPic", "legalAttachment").messages({ "any.required": "file is required" }).required()
    }),
    seniorityLevel:joi.string().valid(seniorityLevelTypes.fresh,seniorityLevelTypes.junior,seniorityLevelTypes.midLevel,seniorityLevelTypes.senior,seniorityLevelTypes.teamLeader,seniorityLevelTypes.expert,seniorityLevelTypes.cto,seniorityLevelTypes.cfo,seniorityLevelTypes.ceo),
    
}