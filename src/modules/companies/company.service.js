import { companyModel } from "../../DB/models/company.model.js";
import { jobModel } from "../../DB/models/jobOpportunity.model.js";
import { asyncHandler, roleTypes } from "../../utilies/index.js";
import cloudinary from './../../utilies/cloudinary/index.js';

// ---------------------------------- addCompany ---------------------------------------
export const addCompany = asyncHandler(async (req, res, next) => {
    const { companyName,description,industry,address,numberOfEmploye,companyEmail} = req.body;
    // check if company name or email already exist
    if (await companyModel.findOne({ companyName: companyName }) || await companyModel.findOne({ companyEmail: companyEmail })) {
        return next(new Error("company name or email already exist", { cause: 400 }))
    }
    if (!req?.file) {
        return next(new Error("please upload your legal attachment first", { cause: 400 }))
    }
    // upload files on cloudinary
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path, { folder: "job_search/companies" })
    const company = await companyModel.create({
        companyName,
        description,
        industry,
        address,
        numberOfEmploye,
        companyEmail,
        createdBy:req.user._id,
        legalAttachment: {secure_url,public_id}
    })
    return res.status(201).json({ msg: "company created successfully", company });
})

// ---------------------------------- updateCompany ---------------------------------------
export const updateCompany = asyncHandler(async(req,res,next)=>{
    const {companyId} = req.params;
    const company = await companyModel.findOneAndUpdate({_id:companyId,createdBy:req.user._id,isDeleted:{$exists:false},pannedAt:{$exists:false}},req.body,{new:true});
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    return res.status(200).json({ msg: "company updated successfully", company });
})


// ---------------------------------- softDeleteCompany ---------------------------------------
export const softDeleteCompany = asyncHandler(async(req,res,next)=>{
    const {companyId} = req.params;
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false}});
    if(!company){
        return next(new Error("company not found", { cause: 400 }))
    }
    if (company.createdBy.toString() != req.user._id.toString() && req.user.role != roleTypes.admin && req.user.role != roleTypes.superAdmin) {
        return next(new Error("un authorized", { cause: 400 }))
    }
    await companyModel.updateOne({ _id: companyId }, { isDeleted: true });
    await jobModel.updateMany({company:companyId},{$set:{closed:true}});
    return res.status(200).json({ msg: "company deleted successfully"});
})


// ---------------------------------- pannedCompany ---------------------------------------
export const pannedCompany = asyncHandler(async(req,res,next)=>{
    const {companyId} = req.params;
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false}});
    if(!company){
        return next(new Error("company not found", { cause: 400 }))
    }
    await companyModel.updateOne({ _id: companyId }, { pannedAt: Date.now() });
    await jobOpportunityModel.updateMany({company:companyId},{$set:{closed:true}});
    return res.status(200).json({ msg: "company panned successfully"});
})


// ---------------------------------- getCompanyWithJobs ---------------------------------------
export const getCompanyWithJobs = asyncHandler(async(req,res,next)=>{
    const {companyId} = req.params;
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},approvedByAdmin:true}).populate([
        {path:"jobs"}
    ]);
    if(!company){
        return next(new Error("company not found", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done",company});
})



// ---------------------------------- getCompanyByname ---------------------------------------
export const getCompanyByname = asyncHandler(async(req,res,next)=>{
    const {companyName} = req.body;
    const company = await companyModel.findOne({companyName,isDeleted:{$exists:false},pannedAt:{$exists:false},approvedByAdmin:true})
    if(!company){
        return next(new Error("company not found", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done",company});
})


// ---------------------------------- uploadCompanyLogo -------------------------------------

export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {
    const {companyId} = req.params
    if (!req.file) {
        return next(new Error("pleaes upload image", { cause: 400 }))
    }
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{folder:"job_search/companies"})
    const company = await companyModel.findOneAndUpdate({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id},{Logo:{secure_url,public_id}},{new:true})
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done",company});
})


// ---------------------------------- uploadCompanyCoverPic -------------------------------------

export const uploadCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const {companyId} = req.params
    if (!req.file) {
        return next(new Error("pleaes upload image", { cause: 400 }))
    }
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{folder:"job_search/companies"})
    const company = await companyModel.findOneAndUpdate({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id},{coverPic:{secure_url,public_id}},{new:true})
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done",company});
})



// ---------------------------------- updateCompanyLogo -------------------------------------

export const updateCompanyLogo = asyncHandler(async (req, res, next) => {
    const {companyId} = req.params
    if (!req.file) {
        return next(new Error("pleaes upload image", { cause: 400 }))
    }
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id})
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{folder:"job_search/companies"})
    await cloudinary.uploader.destroy(company.Logo.public_id)
    await companyModel.updateOne({_id:companyId},{Logo:{secure_url,public_id}},{new:true})
    return res.status(200).json({ msg: "done",company});
})


// ---------------------------------- updateCompanyCoverPic -------------------------------------

export const updateCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const {companyId} = req.params
    if (!req.file) {
        return next(new Error("pleaes upload image", { cause: 400 }))
    }
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id})
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{folder:"job_search/companies"})
    await cloudinary.uploader.destroy(company.coverPic.public_id)
    await companyModel.updateOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id},{coverPic:{secure_url,public_id}},{new:true})
    return res.status(200).json({ msg: "done",company});
})


// ---------------------------------- deteleteCompanyLogo -------------------------------------

export const deteleteCompanyLogo = asyncHandler(async (req, res, next) => {
    const {companyId} = req.params
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id})
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    await cloudinary.uploader.destroy(company.Logo.public_id)
    await companyModel.updateOne({_id:companyId},{Logo:{}},{new:true})
    return res.status(200).json({ msg: "done"});
})



// ---------------------------------- deleteCompanyCoverPic -------------------------------------

export const deleteCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const {companyId} = req.params
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id})
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    await cloudinary.uploader.destroy(company.coverPic.public_id)
    await companyModel.updateOne({_id:companyId},{coverPic:{}},{new:true})
    return res.status(200).json({ msg: "done"});
})


// ---------------------------------- approveCompanyByAdmin -------------------------------------

export const approveCompanyByAdmin = asyncHandler(async (req, res, next) => {
    const {companyId} = req.params
    const company = await companyModel.findOne({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false}})
    if(!company){
        return next(new Error("company not found", { cause: 400 }))
    }
    if (company.approvedByAdmin) {
        return next(new Error("company already approved", { cause: 400 }))
    }
    await companyModel.updateOne({_id:companyId},{approvedByAdmin:true},{new:true})
    return res.status(200).json({ msg: "company approved successfully"});
})

// ---------------------------------- addHrToCompany -------------------------------------
export const addHrToCompany = asyncHandler(async (req, res, next) => {
    const {companyId,userId} = req.params
    const company = await companyModel.findOneAndUpdate({_id:companyId,isDeleted:{$exists:false},pannedAt:{$exists:false},createdBy:req.user._id},{$addToSet:{HRs:userId}},{new:true})
    if(!company){
        return next(new Error("company not found or un authorized", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done",company});
})
