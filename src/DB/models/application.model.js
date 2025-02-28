import mongoose from "mongoose";
import { applicationStatusTypes } from "../../utilies/enum.js";

const appSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobOpportunity",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userCV:{
        secure_url: String,
        public_id: String
    },
    status: {
        type: String,
        enum: Object.values(applicationStatusTypes),
        default: applicationStatusTypes.pending
    }
},{
    timestamps: true
})

export const applicationModel = mongoose.models.Application || mongoose.model("Application", appSchema);