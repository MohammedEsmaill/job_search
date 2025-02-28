import mongoose from "mongoose";
const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        unique: true,
        required: true,
        minLength: 3,
    },
    description:{
        type: String,
        required: true,
        trim: true,
        minLength: 10
    },
    industry: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    address: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    numberOfEmploye: {
        type: Number,
        required: true,
        min:2,
        max:500
    },
    companyEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^(?!.*\.{2})[a-zA-Z0-9][a-zA-Z0-9#$%&\*\+-/=\?\_`|~]*@[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,4}$/
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    Logo:{
        secure_url: String,
        public_id: String
    },
    coverPic: {
        secure_url: String,
        public_id: String
    },
    HRs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    legalAttachment:{
        secure_url: String,
        public_id: String
    },
    approvedByAdmin: {
        type: Boolean,
        default: false
    },
    isDeleted:Boolean,
    pannedAt:Date
},{
    timestamps: true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
companySchema.virtual("jobs",{
    ref:"JobOpportunity",
    localField:"_id",
    foreignField:"companyId"
})
export const companyModel = mongoose.models.Company || mongoose.model("Company", companySchema);