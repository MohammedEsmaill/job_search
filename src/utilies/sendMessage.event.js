import { EventEmitter } from "events";
import { sendMessage,html } from "../services/index.js";
import {userModel} from "../DB/models/index.js";
import { Hash } from "./hash.js";
import { customAlphabet } from "nanoid";
import { otpTypes } from "./enum.js";
export const eventEmitter = new EventEmitter();
// -------------------- sendEmailOtp --------------------
eventEmitter.on("sendEmailOtp",async(data)=>{
    const {email} = data;
    const otp = customAlphabet("0123456789",4)()
    const hash = Hash({key:otp,SALT_ROUNDS:process.env.SALT_ROUNDS})
    await userModel.updateOne({email},{$addToSet:{otp:{code:hash,type:otpTypes.confirmEmail}}})
    const emailSender = await sendMessage(email,"confirm email",html({msg:"confirm email otp",otp:otp}))
    if (!emailSender) {
        return next(new Error("failed to send email",{cause:500}))
    }
})

// -------------------- sendPasswordOtp --------------------
eventEmitter.on("sendPasswordOtp",async(data)=>{
    const {email} = data;
    const otp = customAlphabet("0123456789",4)()
    const hash = Hash({key:otp,SALT_ROUNDS:process.env.SALT_ROUNDS})
    await userModel.updateOne({email},{$addToSet:{otp:{code:hash,type:otpTypes.forgetPassword}}})
    const emailSender = await sendMessage(email,"reset password otp",html({msg:"reset password otp",otp:otp}))
    if (!emailSender) {
        return next(new Error("failed to send email",{cause:500}))
    }
})

// -------------------- sendApplicationReply --------------------
eventEmitter.on("sendApplicationReply",async(data)=>{
    const {email,reply} = data;
    const emailSender = await sendMessage(email,`job Application`,html({msg:`job Application`,otp:reply}))
    if (!emailSender) {
        return next(new Error("failed to send email",{cause:500}))
    }
})