import { applicationStatusTypes, genralRules } from "../../utilies/index.js";
import joi from "joi";

export const addJobSchema = {
    body: joi.object({
        jobTitle: joi.string().min(3).required(),
        jobLocation: joi.string().min(3).required(),
        workingTime: joi.string().min(3).required(),
        seniorityLevel: genralRules.seniorityLevel.required(),
        jobDescription: joi.string().min(3).required(),
        technicalSkills: joi.array().items(joi.string().min(3)).required(),
        softSkills: joi.array().items(joi.string().min(3)).required(),
    })
}
export const updateJobSchema = {
    body: joi.object({
        jobTitle: joi.string().min(3),
        jobLocation: joi.string().min(3),
        workingTime: joi.string().min(3),
        jobDescription: joi.string().min(3),
        technicalSkills: joi.array().items(joi.string().min(3)),
        softSkills: joi.array().items(joi.string().min(3)),
    }),
    params: joi.object({ jobId: genralRules.id.required() }),
    headers: genralRules.headers
}
export const genralJobSchema = {
    params: joi.object({ jobId: genralRules.id.required() }),
    headers: genralRules.headers
}
export const getJobsForSpecificCompanySchema = {
    params: joi.object({
        jobId: genralRules.id,
        companyId: joi.string().min(3).required()
    }),
    headers: genralRules.headers
}
export const getAllJobsByFilterSchema = {
    body: joi.object({
        jobTitle: joi.string().min(3),
        jobLocation: joi.string().min(3),
        workingTime: joi.string().min(3),
        seniorityLevel: genralRules.seniorityLevel,
        technicalSkills: joi.array().items(joi.string().min(3))
    }),
    headers: genralRules.headers
}
export const acceptOrRejectApplicationSchema = {
    params: joi.object({
        applicationId: genralRules.id.required()
    }),
    body: joi.object({
        action: joi.string().valid(applicationStatusTypes.accepted,applicationStatusTypes.rejected,applicationStatusTypes.viewed,applicationStatusTypes.inconsideration)
    }),
    headers: genralRules.headers
}