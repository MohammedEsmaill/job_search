import cors from "cors"
import checkConnection from "./DB/connectionDB.js";
import { rateLimit } from 'express-rate-limit'
import { globalErrorHandling } from "./utilies/errorHandling.js";
import userRouter from "./modules/users/user.controller.js";
import helmet from "helmet";
import { schema } from "./modules/graphql/graphql.schema.js";
import { createHandler } from 'graphql-http/lib/use/express';
import companyRouter from "./modules/companies/company.controller.js";
import jobRouter from "./modules/jobs/job.controller.js";
import chatRouter from './modules/chat/chat.controller.js';
const limiter = rateLimit({
    limit: 20,
    windowMs: 2 * 60 * 1000,
    handler: (req, res, next) => {
        return next(new Error("Too many requests, please try again after 2 minutes",{cause:429}))
    }
})
const bootstrap = (app,express)=>{
    app.use(cors())
    app.use(limiter)
    app.use(helmet());
    app.use(express.json());
    checkConnection()
    app.get("/",(req,res,next)=>{
        return res.status(200).json({msg:"hello on my jop-search app"})
    })
    app.use("/users",userRouter)
    app.use("/companies",companyRouter)
    app.use("/jobs",jobRouter)
    app.use("/chat",chatRouter)
    app.use("/graphql",createHandler({schema:schema}));
    app.use("*",(req,res,next)=>{
        return next(new Error(`error invalid url / ${req.originalUrl}`,{cause:404}))
    })
    app.use(globalErrorHandling)
}
export default bootstrap;