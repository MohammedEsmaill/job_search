import mongoose from 'mongoose';
import { genderTypes, providerTypes, roleTypes,Hash, otpTypes, encrypt, decrypt } from '../../utilies/index.js';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        lowercase: true,
        minLength: 3,
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true,
        minLength: 3,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^(?!.*\.{2})[a-zA-Z0-9][a-zA-Z0-9#$%&\*\+-/=\?\_`|~]*@[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,4}$/
    },
    password: {
        type: String,
        required: function () {
            return this.provider === providerTypes.google ? false : true
        },
        minLength: 8,
        trim: true
    },
    provider: {
        type: String,
        enum: Object.values(providerTypes),
        default: providerTypes.system
    },
    gender: {
        type: String,
        enum: Object.values(genderTypes),
        default: genderTypes.Male
    },
    dateOfBirth: {
        type: Date,
        min: new Date('1940-01-01'),
        max: new Date('2007-01-01'),
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(roleTypes),
        default: roleTypes.user
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean
    },
    deletedAt: Date,
    pannedAt: Date,
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    changeCredentialTime: Date,
    profilePic: {
        secure_url: String,
        public_id: String
    },
    coverPic: {
        secure_url: String,
        public_id: String
    },
    otp:[{
        code: {
            type: String,
            required: true
        },
        type:{
            type: String,
            enum: Object.values(otpTypes),
            required: true
        },
        expiresAt:{
            type: Date,
            default: new Date(Date.now() + 10 * 60 * 1000)
        }
    }]
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
userSchema.virtual('userName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
userSchema.pre("save", async function (next,doc) {
    if (this.isModified("password")) {
        const hash = await Hash({ key: this.password, SALT_ROUNDS: process.env.SALT_ROUNDS })
        this.password = hash
    }
    if (this.isModified("phone")) {
        const cipherPhone = await encrypt({ key: this.phone, SECRET_KEY: process.env.SECRET_KEY })
        this.phone = cipherPhone
    }
    next()
})
userSchema.post("findOne", async function (doc,next) {
    if (doc) {
        const cipherPhone = await decrypt({ key: doc.phone, SECRET_KEY: process.env.SECRET_KEY })
        doc.phone = cipherPhone
    }
    next()
})
export const userModel= mongoose.models.User || mongoose.model("User", userSchema);