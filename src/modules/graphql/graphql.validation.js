import joi from "joi";

export const getAllUsersSchema = joi.object({
    token:joi.string().required()
})