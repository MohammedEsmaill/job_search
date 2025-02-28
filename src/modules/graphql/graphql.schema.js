import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { dataQuery } from "./fields.js";

export const schema = new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"query",
        fields:{
            ...dataQuery
        }
    })
});
