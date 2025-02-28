import { asyncHandler,AppError } from "../utilies/errorHandling.js";

export const validation = (schema) => {
    return asyncHandler(
        async(req, res, next) => {
            let validationResult = [];
            for (const key of Object.keys(schema)) {
                const validationError = schema[key].validate(req[key], { abortEarly: false })
                if (validationError?.error) {
                    validationResult.push(validationError?.error?.details)
                }
            }
            if (validationResult.length>0) {
                return next(new AppError(validationResult,400))
            }
            next()
        }
    )
}

export const graphValidation = async({schema,data}={}) => {
    const {error} = schema.validate(data,{abortEarly:false})
    if (error) {
        throw new Error(error.details.map((detail) => detail.message).join(","),{cause:400})
    }
}