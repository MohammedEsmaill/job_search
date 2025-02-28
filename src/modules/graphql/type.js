import { GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";

export const getSpecificUser = new GraphQLObjectType({
    name:"user",
    fields:{
        firstName:{type:GraphQLString},
        lastName:{type:GraphQLString},
        email:{type:GraphQLString},
        phone:{type:GraphQLString},
        role:{type:GraphQLString},
        provider:{type:GraphQLString},
        gender:{type:GraphQLString},
        dateOfBirth:{type:GraphQLString},
        confirmed:{type:GraphQLString}
    }
})

export const getAllUsers = new GraphQLList(getSpecificUser)

export const getSpecificCompany = new GraphQLObjectType({
    name:"Company",
    fields:{
        companyName:{type:GraphQLString},
        description:{type:GraphQLString},
        industry:{type:GraphQLString},
        address:{type:GraphQLString},
        numberOfEmploye:{type:GraphQLString},
        email:{type:GraphQLString},
        logo:{type:new GraphQLObjectType({
            name:"logo",
            fields:{
                secure_url:{type:GraphQLString},
                public_id:{type:GraphQLString}
            },
        })},
        coverPic:{type:new GraphQLObjectType({
            name:"coverPic",
            fields:{
                secure_url:{type:GraphQLString},
                public_id:{type:GraphQLString}
            }
        })},
        legalAttachment:{type:new GraphQLObjectType({
            name:"legalAttachment",
            fields:{
                secure_url:{type:GraphQLString},
                public_id:{type:GraphQLString}
            }
        })}
    }
})

export const getAllCompanies = new GraphQLList(getSpecificUser)


