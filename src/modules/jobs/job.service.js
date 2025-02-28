import { applicationModel, companyModel, jobModel } from "../../DB/models/index.js";
import { asyncHandler } from "../../utilies/errorHandling.js";
import { pagination } from './../../utilies/features/index.js';
import cloudinary from './../../utilies/cloudinary/index.js';
import { eventEmitter } from "../../utilies/sendMessage.event.js";
import { notifyHRAboutApplication } from "../socket/socket.js";

// ---------------------------------- addJob ---------------------------------------
export const addJob = asyncHandler(async (req, res, next) => {
    const company = await companyModel.findOne({ isDeleted: { $exists: false }, pannedAt: { $exists: false }, $or: [{ createdBy: req.user._id }, { HRs: { $in: [req.user._id] } }] })
    if (!company) {
        return next(new Error("un authorized", { cause: 400 }))
    }
    const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;
    const job = await jobModel.create({ companyId: company._id, jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, addedBy: req.user._id });
    return res.status(200).json({ msg: "job added successfully", job });
})


// ---------------------------------- updateJob ---------------------------------------
export const updateJob = asyncHandler(async (req, res, next) => {
    const job = await jobModel.findOneAndUpdate({ _id: req.params.jobId, addedBy: req.user._id }, { ...req.body }, { new: true });
    if (!job) {
        return next(new Error("job not found or un authorized", { cause: 400 }))
    }
    return res.status(200).json({ msg: "job updated successfully", job });
})



// ---------------------------------- deleteJob ---------------------------------------
export const deleteJob = asyncHandler(async (req, res, next) => {
    const job = await jobModel.findOne({ _id: req.params.jobId }).populate([{ path: "companyId" }]);
    if (!job) {
        return next(new Error("job not found", { cause: 400 }))
    }
    if (!job.companyId.HRs.includes(req.user._id)) {
        return next(new Error("un authorized", { cause: 400 }))
    }
    await jobModel.deleteOne({ _id: req.params.jobId });
    return res.status(200).json({ msg: "job deleted successfully"});
})



// ---------------------------------- getJobsForSpecificCompany ---------------------------------------

export const getJobsForSpecificCompany = asyncHandler(async (req, res, next) => {
    const { jobId, companyId } = req.params;
    
    if (!companyId) {
        return next(new Error("Company ID is required", { cause: 400 }));
    }
    
    // First find the company
    const company = await companyModel.findOne({ 
        isDeleted: { $exists: false }, 
        pannedAt: { $exists: false }, 
        $or: [
            { _id: companyId },
            { companyName: companyId }
        ]
    })
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }
    // Then find jobs for this company
    const { data: jobs, myPage } = await pagination({
        model: jobModel,
        body: { companyId: company._id },
        sort: { createdAt: -1 }
    });
    
    if (!jobs || jobs.length === 0) {
        return next(new Error("no jobs found", { cause: 404 }));
    }
    if (jobId) {
        const job = jobs.find(job => job._id.toString() === jobId);
        if (!job) {
            return next(new Error("Job not found", { cause: 404 }));
        }
        return res.status(200).json({msg: "done",job: job});
    } 
    return res.status(200).json({msg: "done",jobs: jobs,page: myPage});
});



// ---------------------------------- getAllJobsByFilter ---------------------------------------
export const getAllJobsByFilter = asyncHandler(async (req, res, next) => {
    const { data, myPage } = await pagination({
        model: jobModel,
        body: {...req.body}
    });
    if (!data || data.length === 0) {
        return next(new Error("no jobs found", { cause: 404 }));
    }
    return res.status(200).json({msg: "done",jobs: data,page: myPage});
})

// ---------------------------------- getAllApplicationsforSpecificJob ---------------------------------------
export const getAllApplicationsforSpecificJob = asyncHandler(async (req, res, next) => {
    const job = await jobModel.findOne({ _id: req.params.jobId });
    if (!job) {
        return next(new Error("job not found", { cause: 400 }))
    }
    const company = await companyModel.findOne({ _id: job.companyId,isDeleted: { $exists: false }, pannedAt: { $exists: false }, $or: [{ createdBy: req.user._id }, { HRs: { $in: [req.user._id] } }] })
    if (!company) {
        return next(new Error("un authorized", { cause: 400 }))
    }
    console.log(company);
    
    const {data,myPage} = await pagination({
        model: applicationModel,
        body: { jobId: req.params.jobId }
    })
    if (!data) {
        return next(new Error("no applications found for this job", { cause: 400 }))
    }
    return res.status(200).json({msg: "done",applications: data,page: myPage});
})

// ---------------------------------- Job application ---------------------------------------
export const applyForJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params;
    const job = await jobModel.findOne({ _id: jobId,closed:false });
    if (!job) {
        return next(new Error("job not found", { cause: 400 })) 
    }
    if (await applicationModel.findOne({ jobId, userId: req.user._id })) {
        return next(new Error("you have already applied for this job", { cause: 400 }))
    }
    if(!req.file){
        return next(new Error("CV is required", { cause: 400 }))
    }
    const userCV = req.file.path
    const {secure_url,public_id} = await cloudinary.uploader.upload(userCV,{folder:"job_search/applications"})
    const application = await applicationModel.create({ jobId, userId: req.user._id,userCV:{secure_url,public_id} });
    
    // notify the HR
    const hrId = job.addedBy
    const io = req.app.get('io');
    notifyHRAboutApplication(io, hrId, {
        applicationId: application._id,
        jobTitle: job.jobTitle,
        applicantName: req.user.name,
        submittedAt: new Date()
    })
    return res.status(201).json({msg: "done",application});
})

// ---------------------------------- acceptOrRejectApplication ---------------------------------------
export const acceptOrRejectApplication = asyncHandler(async (req, res, next) => {
    const { applicationId } = req.params;
    const application = await applicationModel.findOne({ _id: applicationId }).populate([{ path: "jobId", populate: { path: "companyId" } }]);
    if (!application) {
        return next(new Error("application not found", { cause: 400 }))
    }
    if (!application.jobId) {
        return next(new Error("job not found", { cause: 400 }))
    }
    if (!application.jobId.companyId.HRs.includes(req.user._id)) {
        return next(new Error("un authorized", { cause: 400 }))
    }
    let action;
    if (req.body.action === "accepted") {
        action = "accepted";
        eventEmitter.emit("sendApplicationReply", { email: application.userId.email, reply: "your job application has been accepted" });
    } 
    else if (req.body.action === "rejected") {
        action = "rejected";
        eventEmitter.emit("sendApplicationReply", { email: application.userId.email, reply: "your job application has been rejected" });
    }
    else if (req.body.action === "inconsideration") {
        action = "inconsideration";
        eventEmitter.emit("sendApplicationReply", { email: application.userId.email, reply: "your job application has been inconsideration" });
    }
    if (!action) {
        action = "viewed";
    }
    const updatedApplication = await applicationModel.findOneAndUpdate({ _id: applicationId }, { status: action }, { new: true });
    return res.status(200).json({msg: "done",application: updatedApplication});
})