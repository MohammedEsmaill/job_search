import { Router } from 'express';
import * as CS from "./company.service.js";
import { authentication, authorization,multerHost,tokenTypes,validation } from "../../middleWare/index.js";
import * as CV from "./company.validation.js";
import { extensionType, roleTypes } from '../../utilies/enum.js';
import jobRouter from '../jobs/job.controller.js';
const companyRouter = Router()
companyRouter.use("/:companyId/jobs",jobRouter)
companyRouter.post("/addCompany",multerHost(extensionType.pdf).single("legalAttachment"),validation(CV.addCompanySchema),authentication(),CS.addCompany)
companyRouter.patch("/updateCompany/:companyId",validation(CV.updateCompanySchema),authentication(),CS.updateCompany)
companyRouter.delete("/deleteCompany/:companyId",authentication(),validation(CV.genralCompanySchema),CS.softDeleteCompany)
companyRouter.patch("/pannedCompany/:companyId",authentication(),validation(CV.genralCompanySchema),authorization(roleTypes.admin),CS.pannedCompany),
companyRouter.get("/:companyId",authentication(),validation(CV.genralCompanySchema),CS.getCompanyWithJobs)
companyRouter.get("/",authentication(),validation(CV.getCompanyBynameSchema),CS.getCompanyByname)
companyRouter.patch("/uploadCompanyLogo/:companyId",multerHost(extensionType.image).single("Logo"),validation(CV.genralCompanyImagesSchema),authentication(),CS.uploadCompanyLogo)
companyRouter.patch("/uploadCompanyCover/:companyId",multerHost(extensionType.image).single("coverPic"),validation(CV.genralCompanyImagesSchema),authentication(),CS.uploadCompanyCoverPic)
companyRouter.patch("/updateCompanyLogo/:companyId",multerHost(extensionType.image).single("Logo"),validation(CV.genralCompanyImagesSchema),authentication(),CS.updateCompanyLogo)
companyRouter.patch("/updateCompanyCover/:companyId",multerHost(extensionType.image).single("coverPic"),validation(CV.genralCompanyImagesSchema),authentication(),CS.updateCompanyCoverPic)
companyRouter.patch("/deteleteCompanyLogo/:companyId",authentication(),validation(CV.genralCompanySchema),CS.deteleteCompanyLogo)
companyRouter.patch("/deteleteCompanyCover/:companyId",authentication(),validation(CV.genralCompanySchema),CS.deleteCompanyCoverPic)
companyRouter.patch("/approveCompany/:companyId",authentication(),validation(CV.genralCompanySchema),authorization(roleTypes.admin),CS.approveCompanyByAdmin)
companyRouter.post("/addHrToCompany/:companyId/:userId",authentication(),validation(CV.addHrToCompanySchema),CS.addHrToCompany)
export default companyRouter
