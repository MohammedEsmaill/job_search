import joi from 'joi';
export const getChatSchema = {
    params: joi.object({
        userId: joi.string().required()
    }).required()
}