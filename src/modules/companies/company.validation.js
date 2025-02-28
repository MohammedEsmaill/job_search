import { genralRules } from "../../utilies/index.js";
import joi from "joi";

export const addCompanySchema = {
    body: joi.object({
        companyName: joi.string().min(3).required(),
        description: joi.string().min(3).required(),
        industry: joi.string().min(3).required(),
        address: joi.string().min(3).required(),
        numberOfEmploye: joi.string().required(),
        companyEmail: genralRules.email.required()
    }),
    headers: genralRules.headers,
    file: genralRules.companiesFile.required()
}
export const updateCompanySchema = {
    body: joi.object({
        companyName: joi.string().min(3),
        description: joi.string().min(3),
        industry: joi.string().min(3),
        address: joi.string().min(3),
        numberOfEmploye: joi.string()
    }),
    headers: genralRules.headers
}
export const genralCompanySchema = {
    params: joi.object({ companyId: genralRules.id.required() }),
    headers: genralRules.headers
}
export const genralCompanyImagesSchema = {
    file: genralRules.companiesFile.required(),
    headers: genralRules.headers
}
export const getCompanyBynameSchema = {
    body: joi.object({
        companyName: joi.string().min(3).required()
    }),
    headers: genralRules.headers
}
export const addHrToCompanySchema = {
    params: joi.object({
        companyId: genralRules.id.required(),
        userId: genralRules.id.required()
    }),
    headers: genralRules.headers
}
