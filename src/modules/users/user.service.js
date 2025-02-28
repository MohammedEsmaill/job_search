import { userModel } from "../../DB/models/index.js";
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler, compare, encrypt, eventEmitter, generateToken, Hash, otpTypes, providerTypes, roleTypes } from "../../utilies/index.js";
import cloudinary from './../../utilies/cloudinary/index.js';
// ---------------------------------- signUP ---------------------------------------
export const signUp = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, gender, dateOfBirth, phone } = req.body;
    // check if user already exist
    const users = await userModel.findOne({ email: email });
    if (users) {
        return next(new Error("user already exist", { cause: 400 }))
    }
    // check if user dosen't upload his image 
    if (!req?.files) {
        return next(new Error("please upload your profile image & cover image first", { cause: 400 }))
    }
    const profilePic = await cloudinary.uploader.upload(req.files.profilePic[0].path, { folder: "job_search/users" })
    const coverPic = await cloudinary.uploader.upload(req.files.coverPic[0].path, { folder: "job_search/users" })
    // encrypt phone
    const cipherPhone = encrypt({ key: phone, SECRET_KEY: process.env.SECRET_KEY })
    // send req to db
    const user = await userModel.create({ firstName, lastName, gender, dateOfBirth, email, password, phone: cipherPhone, profilePic: { secure_url: profilePic.secure_url, public_id: profilePic.public_id }, coverPic: { secure_url: coverPic.secure_url, public_id: coverPic.public_id } });
    // send email confirmation otp
    eventEmitter.emit("sendEmailOtp", { email })
    return res.status(201).json({ msg: "user created successfully", user });

})

// ---------------------------------- confirmEmail ---------------------------------------

export const confirmEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    // ckeck if user not exist
    const user = await userModel.findOne({ email: email });
    if (!user) {
        return next(new Error("Invalid email", { cause: 400 }))
    }
    // ckeck if user confirmed before
    if (user.confirmed) {
        return next(new Error("You are already confirmed", { cause: 400 }))
    }
    if (user.otp.length == 0) {
        return next(new Error("Invalid otp", { cause: 400 }))
    }
    for (const otp of user.otp) {
        if (otp.type == otpTypes.confirmEmail) {
            // ckeck if otp expired
            const now = new Date().getTime();
            if ((now - otp.expiresAt.getTime()) > 600000) {
                return next(new Error("expired otp", { cause: 400 }))
            }
            const match = compare({ key: req.body.otp, hashed: otp.code })
            console.log(match);
            
            if (!match) {
                return next(new Error("Invalid otp", { cause: 400 }))
            }
            await userModel.findOneAndUpdate({ email }, { confirmed: true, $pull: { otp: { type: otpTypes.confirmEmail } } });
            return res.status(200).json({ msg: "done" });
        }
        return next(new Error("Invalid otp", { cause: 400 }))
    }
})

// ---------------------------------- sendAnotherOtpEmail ---------------------------------------

export const sendAnotherOtpEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    // ckeck if user not exist
    const user = await userModel.findOne({ email: email, isDeleted: { $exists: false },pannedAt:{ $exists: false } });
    if (!user) {
        return next(new Error("Invalid email", { cause: 400 }))
    }
    // delet the old otp
    if (user.otp.length > 0) {
        for (const otp of user.otp) {
            if (otp.type == otpTypes.confirmEmail) {
                await userModel.findOneAndUpdate({ email }, { $pull: { otp: { type: otpTypes.confirmEmail } } });
            }
        }
    }
    // send email confirmation otp 
    eventEmitter.emit("sendEmailOtp", { email,msg:"confirm Email",type:otpTypes.confirmEmail })
    return res.status(200).json({ msg: "done" });
})

// ---------------------------------- Login ---------------------------------------

export const logIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // ckeck if user not exist
    const user = await userModel.findOne({ email: email,pannedAt:{ $exists: false }, isDeleted: { $exists: false }, provider: providerTypes.system });
    if (!user) {
        return next(new Error("user not exist or deleted", { cause: 400 }))
    }
    // check if user not confirmed
    if (user.confirmed == false) {
        return next(new Error("You are not confirmed yet", { cause: 400 }))
    }
    // check the password matched or not
    if (!await compare({ key: password, hashed: user.password })) {
        return next(new Error("Invalid password", { cause: 400 }))
    }
    // generate access token
    let accessToken = generateToken({ payload: { userId: user._id }, signture: user.role == roleTypes.user ? process.env.ACCESS_TOKEN_SIGNTURE_USER : process.env.ACCESS_TOKEN_SIGNTURE_ADMIN, expiresIn: { expiresIn: "1d" } })
    // generate refresh token
    let refrechToken = generateToken({ payload: { userId: user._id }, signture: user.role == roleTypes.user ? process.env.REFRESH_TOKEN_SIGNTURE_USER : process.env.REFRESH_TOKEN_SIGNTURE_ADMIN, expiresIn: { expiresIn: "1w" } })
    return res.status(200).json({ msg: "user logedIn successfully", token: { access_token: accessToken, refresh_token: refrechToken } });
})

// ---------------------------------- socialSignUp ---------------------------------------

export const signUpWithGmail = asyncHandler(async (req, res, next) => {
    const client = new OAuth2Client();
    async function verify() {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    }
    const { email, email_verified, picture, name } = await verify()
    let user = userModel.findOne({ email })
    if (!user) {
        user = await userModel.create({
            name,
            email,
            confirmed: email_verified,
            image: picture,
            provider: providerTypes.google
        })
    }
    if (user.provider == providerTypes.system) {
        return next(new Error("please login with in system"))
    }
    if (user) {
        return next(new Error("user already exist", { cause: 400 }))
    }
    return res.status(201).json({ msg: "user created successfully" });
})
// ---------------------------------- socialLogin ---------------------------------------

export const loginWithGmail = asyncHandler(async (req, res, next) => {
    const client = new OAuth2Client();
    async function verify() {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    }
    const { email, email_verified, picture, name } = await verify()
    let user = userModel.findOne({ email, provider: providerTypes.google,pannedAt:{ $exists: false }, isDeleted: { $exists: false } })
    if (!user) {
        return next(new Error("user not exist", { cause: 400 }))
    }
    if (user.provider == providerTypes.system) {
        return next(new Error("please login with in system"))
    }
    // generate access token
    let accessToken = generateToken({ payload: { userId: user._id }, signture: user.role == roleTypes.user ? process.env.TOKEN_SIGNTURE_USER : process.env.TOKEN_SIGNTURE_ADMIN, expiresIn: { expiresIn: "1d" } })
    return res.status(201).json({ msg: "Done", accessToken });
})


// ---------------------------------- forgetPassword ---------------------------------------

export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    // ckeck if user not exist
    const user = await userModel.findOne({ email: email,pannedAt:{ $exists: false }, isDeleted: { $exists: false } });
    if (!user) {
        return next(new Error("Invalid email or deleted", { cause: 400 }))
    }
    // delet the old otp
    if (user.otp.length > 0) {
        for (const otp of user.otp) {
            if (otp.type == otpTypes.forgetPassword) {
                await userModel.findOneAndUpdate({ email }, { $pull: { otp: { type: otpTypes.forgetPassword } } });
            }
        }
    }
    // send email confirmation otp 
    eventEmitter.emit("sendPasswordOtp", { email })
    return res.status(200).json({ msg: "done" });
})


// ---------------------------------- resetPassword ---------------------------------------

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    // ckeck if user not exist
    const user = await userModel.findOne({ email, isDeleted: { $exists: false },pannedAt:{ $exists: false }});
    if (!user) {
        return next(new Error("Invalid email", { cause: 400 }))
    }
    for (const otp of user.otp) {
        if (otp.length == 0) {
            return next(new Error("Invalid otp", { cause: 400 }))
        }
        if (otp.type == otpTypes.forgetPassword) {
            // ckeck if otp expired
            const now = new Date().getTime();
            if ((now - otp.expiresAt.getTime()) > 600000) {
                return next(new Error("expired otp", { cause: 400 }))
            }
            const match = compare({ key: req.body.otp, hashed: otp.code })
            if (!match) {
                return next(new Error("Invalid otp", { cause: 400 }))
            }
            const hashed = await Hash({ key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS })
            await userModel.findOneAndUpdate({ email }, { password:hashed,changeCredentialTime:Date.now(),$pull: { otp: { type: otpTypes.forgetPassword } } });
            return res.status(200).json({ msg: "done" });
        }
        return next(new Error("Invalid otp", { cause: 400 }))
    }
})



// ---------------------------------- refreshToken ---------------------------------------

export const refreshToken = asyncHandler(async (req, res, next) => {
    // generate access token
    let accessToken = generateToken({ payload: { userId: req.user._id }, signture: req.user.role == roleTypes.user ? process.env.ACCESS_TOKEN_SIGNTURE_USER : process.env.ACCESS_TOKEN_SIGNTURE_ADMIN, expiresIn: { expiresIn: "1d" } })
    // generate refresh token
    let refrechToken = generateToken({ payload: { userId: req.user._id }, signture: req.user.role == roleTypes.user ? process.env.REFRESH_TOKEN_SIGNTURE_USER : process.env.REFRESH_TOKEN_SIGNTURE_ADMIN, expiresIn: { expiresIn: "1w" } })
    return res.status(200).json({ msg: "done", token: { access_token: accessToken, refresh_token: refrechToken } });
})

// ---------------------------------- delete expired OTPs ---------------------------------------

export const deleteExpiredOtp = async () => {
    await userModel.updateMany({ "otp.expiresAt": { $lt: new Date() } }, { $pull: { otp: { expiresAt: { $lt: new Date() } } } });
}

// ---------------------------------- GetUserData ---------------------------------------

export const getUser = asyncHandler(async (req, res, next) => {
    return res.status(200).json({ msg: "Done", user: req.user });
})


// ---------------------------------- updateProfile ---------------------------------------

export const updateProfile = asyncHandler(async (req, res, next) => {
    if (req.body.phone) {
        // encrypt phone
        req.body.phone = encrypt({ key: req.body.phone, SECRET_KEY: process.env.SECRET_KEY })
    }
    const user = await userModel.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true })
    return res.status(200).json({ msg: "user updated successfully", user });
})

// ---------------------------------- shareProfile ---------------------------------------

export const shareProfile = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const user = await userModel.findOne({ _id: id, isDeleted: { $exists: false },pannedAt:{ $exists: false }}).select("-changeCredentialTime -confirmed -__v -role -provider -profilePic.public_id -coverPic.public_id -password -email -otp -gender -dateOfBirth -_id").exec();
    // ckeck if user not exist
    if (!user) {
        return next(new Error("Invalid email", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done", user: user });
})

// ---------------------------------- updateUserPaasword ---------------------------------------

export const updateUserPassword = asyncHandler(async (req, res, next) => {
    const { password, newPassword } = req.body;
    // compare the password
    if (!await compare({ key: password, hashed: req.user.password })) {
        return next(new Error("password not matched", { cause: 400 }))
    }
    // check the new value of password
    if (password == newPassword) {
        return next(new Error("please input new value for your password", { cause: 400 }))
    }
    // hash new password
    const hashed = Hash({ key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS })
    const updatedUser = await userModel.findByIdAndUpdate(req.user._id, { password: hashed, changeCredentialTime: Date.now() })
    return res.status(200).json({ msg: "Done", updatedUser });
})

// ---------------------------------- updateprofilePic -------------------------------------

export const updateProfilePic = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("pleaes upload image", { cause: 400 }))
    }
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{folder:"job_search/users"})
    await cloudinary.uploader.destroy(req.user.profilePic.public_id)
    const user = await userModel.findOneAndUpdate({_id:req.user._id},{profilePic:{secure_url,public_id}},{new:true})
    return res.status(200).json({ msg: "user updated successfully",user});
})


// ---------------------------------- updateCoverPic -------------------------------------

export const updateCoverPic = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("pleaes upload image", { cause: 400 }))
    }
    const {secure_url,public_id} = await cloudinary.uploader.upload(req.file.path,{folder:"job_search/users"})
    await cloudinary.uploader.destroy(req.user.coverPic.public_id)
    const user = await userModel.findOneAndUpdate({_id:req.user._id},{coverPic:{secure_url,public_id}},{new:true})
    return res.status(200).json({ msg: "user updated successfully",user});
})


// ---------------------------------- deleteProfilePic -------------------------------------

export const deleteProfilePic = asyncHandler(async (req, res, next) => {
    await cloudinary.uploader.destroy(req.user.profilePic.public_id)
    const user = await userModel.findOneAndUpdate({_id:req.user._id},{profilePic:{}},{new:true})
    return res.status(200).json({ msg: "picture deleted successfully",user});
})


// ---------------------------------- deleteCoverPic -------------------------------------

export const deleteCoverPic = asyncHandler(async (req, res, next) => {
    await cloudinary.uploader.destroy(req.user.coverPic.public_id)
    const user = await userModel.findOneAndUpdate({_id:req.user._id},{coverPic:{}},{new:true})
    return res.status(200).json({ msg: "picture deleted successfully",user});
})


// ---------------------------------- softDelete -------------------------------------

export const deleteUser = asyncHandler(async (req, res, next) => {
    await userModel.findOneAndUpdate({_id:req.user._id},{isDeleted:true})
    return res.status(200).json({ msg: "user deleted successfully"});
})




// ---------------------------------- pannedUser -------------------------------------

export const pannedUser = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userModel.findOne({_id:userId})
    if (!user) {
        return next(new Error("user not found", { cause: 400 }))
    }
    if (user?.pannedAt) {
        await userModel.findOneAndUpdate({_id:userId},{$unset:{pannedAt:0}})
        return res.status(200).json({ msg: "user unpanned successfully"});
    }
    await userModel.findOneAndUpdate({_id:userId},{pannedAt:Date.now()})
    return res.status(200).json({ msg: "user panned successfully"});
})

// ---------------------------------- updateEmail ---------------------------------------

export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    // ckeck if new email exist
    const user = await userModel.findOne({ email });
    if (user) {
        return next(new Error("email already exist", { cause: 400 }))
    }
    // send email confirmation otp
    eventEmitter.emit("changeEmailOtp", { email: req.user.email })
    eventEmitter.emit("sendNewEmailOtp", { email, id: req.user._id })
    // save new email 
    await userModel.updateOne({ _id: req.user._id }, { tempEmail: email })
    return res.status(200).json({ msg: "done" });
})

// ---------------------------------- replaceEmail ---------------------------------------

export const replaceEmail = asyncHandler(async (req, res, next) => {
    const { oldEmailOtp, newEmailOtp } = req.body;
    // ckeck if new email exist
    const user = await userModel.findOne({ _id: req.user._id });
    if (!compare({ key: oldEmailOtp, hashed: user.changeEmailOtp }) || !compare({ key: newEmailOtp, hashed: user.otpNewEmail })) {
        return next(new Error("invalid otp ", { cause: 400 }))
    }
    // save new email 
    const newUser = await userModel.findOneAndUpdate({ _id: req.user._id }, { email: req.user.tempEmail, $unset: { tempEmail: 0, changeEmailOtp: 0, otpNewEmail: 0 } }, { new: true })
    return res.status(200).json({ msg: "done", newUser });
})

// ---------------------------------- dashboard ---------------------------------------

export const dashboard = asyncHandler(async (req, res, next) => {
    const data = await Promise.all([
        userModel.find(),
        postModel.find()
    ])
    return res.status(200).json({ msg: "done", data });
})

// ---------------------------------- updateRole ---------------------------------------

export const updateRole = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.body
    const data = req.user.role === roleTypes.superAdmin ? { role: { $nin: [roleTypes.superAdmin] } } : { role: { $nin: [roleTypes.superAdmin, roleTypes.admin] } }
    const user = await userModel.findOneAndUpdate({ _id: userId, isDeleted: false, ...data }, { role, updatedBy: req.user._id }, { new: true })
    if (!user) {
        return next(new Error("user not found or un authorized", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done", user });
})


// ---------------------------------- enableTwoStepVerfication ---------------------------------------

export const enableTwoStepVerfication = asyncHandler(async (req, res, next) => {
    if (req.user.twoStepVerfication) {
        return next(new Error("two step verfication already enabled", { cause: 400 }))
    }
    eventEmitter.emit("sendTwoStepVerficationOtp", { email: req.user.email, text: "enable" })
    return res.status(200).json({ msg: "done" });
})



// ---------------------------------- verifiyTwoStepVerfication ---------------------------------------

export const verifiyTwoStepVerfication = asyncHandler(async (req, res, next) => {
    const { otp } = req.body;
    if (!otp || !compare({ key: otp, hashed: req.user.twoStepVerficationOtp })) {
        return next(new Error("invalid otp", { cause: 400 }))
    }
    const user = await userModel.findOneAndUpdate({ _id: req.user._id }, { twoStepVerfication: true, $unset: { twoStepVerficationOtp: 0 } }, { new: true })
    return res.status(200).json({ msg: "done", user });
})



// ---------------------------------- twoStepVerficationLogin ---------------------------------------

export const twoStepVerficationLogin = asyncHandler(async (req, res, next) => {
    const { otp, email } = req.body;
    const user = await userModel.findOne({ email: email, provider: providerTypes.system });
    if (!otp || !compare({ key: otp, hashed: user.twoStepVerficationOtp })) {
        return next(new Error("invalid otp", { cause: 400 }))
    }
    // generate access token
    let accessToken = generateToken({ payload: { userId: user._id }, signture: user.role == roleTypes.user ? process.env.ACCESS_TOKEN_SIGNTURE_USER : process.env.ACCESS_TOKEN_SIGNTURE_ADMIN, expiresIn: { expiresIn: "1d" } })
    // generate refresh token
    let refrechToken = generateToken({ payload: { userId: user._id }, signture: user.role == roleTypes.user ? process.env.REFRESH_TOKEN_SIGNTURE_USER : process.env.REFRESH_TOKEN_SIGNTURE_ADMIN, expiresIn: { expiresIn: "1w" } })
    return res.status(200).json({ msg: "user logedIn successfully", token: { access_token: accessToken, refresh_token: refrechToken } });
})





// ------------------------------- blockUser ---------------------------------------

export const blockUser = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userModel.findOne({ _id: req.user._id, blockedUsers: { $in: [userId] } })
    let action;
    let myMsg;
    if (user) {
        myMsg = "user unblocked successfully"
        action = await userModel.updateOne({ _id: req.user._id }, { $pull: { blockedUsers: userId } })
    } else {
        myMsg = "user blocked successfully"
        action = await userModel.updateOne({ _id: req.user._id }, { $addToSet: { blockedUsers: userId } })
    }
    if (!action) {
        return next(new Error("user not found or un authorized", { cause: 400 }))
    }
    return res.status(200).json({ msg: myMsg });
})




// ------------------------------- sendFriendRequset ---------------------------------------

export const sendFriendRequset = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const sender = await userModel.findOne({ _id: req.user._id, isDeleted: false })
    const reciver = await userModel.findOne({ _id: userId, isDeleted: false }).select("-password")
    if (!sender || !reciver) {
        return next(new Error("fail to send friend request", { cause: 400 }))
    }
    // check if user already send friend request
    if (sender.frfriendRequests?.find(user => user.userId.toString() === userId.toString()) ||
        reciver.friendRequests?.find(user => user.userId.toString() === req.user._id.toString()) ||
        sender.friends?.find(user => user.userId.toString() === userId.toString()) ||
        reciver.friends?.find(user => user.userId.toString() === req.user._id.toString())) {
        return next(new Error("fail to send friend request", { cause: 400 }))
    }
    // push request in sender friendRequests list
    sender.friendRequests.push({ userId: userId, action: friendRequestsTypes.sended })
    // push request in reciver friendRequests list
    reciver.friendRequests.push({ userId: req.user._id, action: friendRequestsTypes.recived })
    await sender.save()
    await reciver.save()
    return res.status(200).json({ msg: "friend request sent successfully" });
})




// ------------------------------- acceptFriendRequset ---------------------------------------

export const acceptFriendRequset = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userModel.findOne({ _id: req.user._id })
    const friend = await userModel.findOne({ _id: userId })
    const userExist = user.friendRequests.find(user => user.action === friendRequestsTypes.recived && user.userId.toString() === userId.toString())
    const friendExist = friend.friendRequests.find(user => user.action === friendRequestsTypes.sended && user.userId.toString() === req.user._id.toString())
    if (!userExist || !friendExist) {
        return next(new Error("fail to accept friend request", { cause: 400 }))
    }
    // add friend in my friend list
    user.friends.push(userId)
    // remove friend in my friendRequest list
    user.friendRequests = user.friendRequests.filter(user => user.userId.toString() !== userId.toString())
    // add friend in friend list
    friend.friends.push(req.user._id)
    // remove requset in his friendRequest list
    friend.friendRequests = friend.friendRequests.filter(user => user.userId.toString() !== req.user._id.toString())
    await user.save()
    await friend.save()

    return res.status(200).json({ msg: "done", user });
})




