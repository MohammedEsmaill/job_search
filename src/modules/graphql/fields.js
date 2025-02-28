import { GraphQLNonNull,GraphQLString } from "graphql";
import * as DT from "./type.js";
import * as DR from "./resolve.js";
export const dataQuery = {
    getAllUsers: {
        type: DT.getAllUsers,
        args: {
            token: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: DR.getAllUsers,
    },
    getAllCompanies: {
        type: DT.getAllCompanies,
        args: {
            token: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: DR.getAllCompanies,
    }
}
