import {Router} from "express"
import * as US from "./user.service.js";
import { authentication, authorization,multerHost,tokenTypes,validation } from "../../middleWare/index.js";
import * as UV from "./user.validation.js";
import { extensionType, roleTypes } from "../../utilies/enum.js";
const userRouter = Router();
userRouter.post("/signUp",multerHost(extensionType.image).fields([{name:"profilePic",maxCount:1},{name:"coverPic",maxCount:1}]),validation(UV.signUpSchema),US.signUp)
userRouter.patch("/confirmEmail",validation(UV.confirmEmailSchema),US.confirmEmail)
// userRouter.post("/sendAnotherOtpEmail",validation(UV.anotherOtpEmailSchema),US.sendAnotherOtpEmail)
userRouter.post("/logIn",validation(UV.logInSchema),US.logIn)
userRouter.post("/signUpWithGmail",US.signUpWithGmail)
userRouter.post("/loginWithGmail",US.loginWithGmail)
userRouter.patch("/forgetPassword",validation(UV.forgetPasswordSchema),US.forgetPassword)
userRouter.post("/resetPassword",validation(UV.rsestPasswordSchema),US.resetPassword)
userRouter.get("/refreshToken",validation(UV.refreshTokenSchema),authentication(tokenTypes.refresh),US.refreshToken)
userRouter.patch("/updateProfile",validation(UV.updateProfileSchema),authentication(),US.updateProfile)
userRouter.get("/profile",authentication(),US.getUser)
userRouter.get("/profile/:id",validation(UV.shareProfileSchema),authentication(),US.shareProfile)
userRouter.patch("/updateProfile/password",validation(UV.updatePasswordSchema),authentication(),US.updateUserPassword)
userRouter.patch("/updateProfile/profilePic",multerHost(extensionType.image).single("profilePic"),validation(UV.updateProfilePicSchema),authentication(),US.updateProfilePic)
userRouter.patch("/updateProfile/coverPic",multerHost(extensionType.image).single("coverPic"),validation(UV.updateProfilePicSchema),authentication(),US.updateCoverPic)
userRouter.patch("/updateProfile/deleteProfilePic",authentication(),US.deleteProfilePic)
userRouter.patch("/updateProfile/deleteCoverPic",authentication(),US.deleteCoverPic)
userRouter.delete("/softDeleteProfile",authentication(),authorization(roleTypes.user),US.deleteUser)
userRouter.patch("/pannedUser/:userId",authentication(),authorization(roleTypes.admin),US.pannedUser)
// userRouter.patch("/updateProfile",multerHost(extensionType.image).single("attachment"),validation(UV.updateProfileSchema),authentication(),US.updateProfile)
// userRouter.patch("/update/email",validation(UV.updateEmailSchema),authentication(),US.updateEmail)
// userRouter.patch("/update/replaceEmail",validation(UV.replaceEmailSchema),authentication(),US.replaceEmail)
// userRouter.get("/dashboard",authentication(),authorization([roleTypes.admin,roleTypes.superAdmin]),US.dashboard)
// userRouter.patch("/dashboard/updateRole/:userId",authentication(),authorization([roleTypes.admin,roleTypes.superAdmin]),US.updateRole)
// userRouter.post("/enableTwoStepVerfication", authentication(), US.enableTwoStepVerfication);
// userRouter.post("/verifyTwoStepVerfication", authentication(), validation(UV.verifyTwoStepVerficationSchema), US.verifiyTwoStepVerfication);
// userRouter.post("/blockUser/:userId", authentication(), validation(UV.blockUserSchema), US.blockUser);
// userRouter.post("/sendFriendRequset/:userId", authentication(), validation(UV.sendFriendRequsetSchema), US.sendFriendRequset);
// userRouter.post("/acceptFriendRequset/:userId", authentication(), US.acceptFriendRequset);
export default userRouter;
