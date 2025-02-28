
import { graphAuthentication } from '../../middleWare/auth.js';
import { graphValidation } from '../../middleWare/vaildation.js';
import { roleTypes } from '../../utilies/enum.js';
import { userModel } from '../../DB/models/user.model.js';
import { getAllUsersSchema } from './graphql.validation.js';
import { companyModel } from '../../DB/models/company.model.js';
// --------------------- getAllUsers ---------------------
export const getAllUsers = async (parent, args,) => {
    const { token } = args
    await graphValidation({ schema: getAllUsersSchema, data: args });
    const user = await graphAuthentication({ token})
    if (user.role !== roleTypes.admin || user.role !== roleTypes.superAdmin) {
        return new Error("un authorized", { cause: 400 })
    }
    const users = await userModel.find({ role: roleTypes.user ,isDeleted:{$exists:false},pannedAt:{$exists:false}}).lean().exec();
    return users
}

// --------------------- getAllCompanies ---------------------
export const getAllCompanies = async (parent, args,) => {
    const { token } = args
    await graphValidation({ schema: getAllUsersSchema, data: args });
    const user = await graphAuthentication({ token})
    if (user.role !== roleTypes.admin || user.role !== roleTypes.superAdmin) {
        return new Error("un authorized", { cause: 400 })
    }
    const companies = await companyModel.find({approvedByAdmin:true},{isDeleted:{$exists:false},pannedAt:{$exists:false}}).lean().exec();
    return companies
}