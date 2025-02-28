import { Router } from 'express';
import * as JS from "./job.service.js";
import * as JV from "./job.validation.js";
import { authentication, authorization, multerHost, validation } from "../../middleWare/index.js";
import { extensionType, roleTypes } from '../../utilies/enum.js';
const jobRouter = Router({mergeParams:true})
jobRouter.post("/addJob",authentication(),validation(JV.addJobSchema),JS.addJob)
jobRouter.patch("/updateJob/:jobId",authentication(),validation(JV.updateJobSchema),JS.updateJob)
jobRouter.delete("/deleteJob/:jobId",authentication(),validation(JV.genralJobSchema),JS.deleteJob)
jobRouter.get("/filtter",authentication(),JS.getAllJobsByFilter)
jobRouter.get("/:jobId?",authentication(),validation(JV.getJobsForSpecificCompanySchema),JS.getJobsForSpecificCompany)
jobRouter.get("/:jobId/applications",authentication(),validation(JV.genralJobSchema),JS.getAllApplicationsforSpecificJob)
jobRouter.post("/:jobId/apply",multerHost(extensionType.pdf).single("CV"),authentication(),authorization(roleTypes.user),validation(JV.genralJobSchema),JS.applyForJob)
jobRouter.patch("/:applicationId",authentication(),validation(JV.acceptOrRejectApplicationSchema),JS.acceptOrRejectApplication)
export default jobRouter
