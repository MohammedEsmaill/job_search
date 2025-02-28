import mongoose from "mongoose";
import { jobLocationTypes, seniorityLevelTypes, workingTimeTypes } from "../../utilies/enum.js";

const jobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true,
        minLength: 3,
    },
    jobLocation: {
        type: String,
        required: true,
        enum: Object.values(jobLocationTypes),
    },
    workingTime: {
        type: String,
        required: true,
        enum: Object.values(workingTimeTypes),
    },
    seniorityLevel: {
        type: String,
        required: true,
        enum: Object.values(seniorityLevelTypes)
    },
    jobDescription: {
        type: String,
        required: true,
        minLength: 10
    },
    technicalSkills:[{
        type: String
    }],
    softSkills:[{
        type: String
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updateBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    closed: {
        type: Boolean,
        default: false
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    }
},{
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
jobSchema.virtual("applications",{
    ref:"Application",
    localField:"_id",
    foreignField:"jobId"
})
export const jobModel = mongoose.models.JobOpportunity || mongoose.model("JobOpportunity", jobSchema);