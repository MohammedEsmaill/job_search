import { chatModel } from "../../DB/models/index.js";
import { asyncHandler } from "../../utilies/index.js";


// -------------------------- getChat --------------------------
export const getChat = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const chat = await chatModel.findOne({$or:[{senderId:req.user._id,reciverId:userId},{senderId:userId,reciverId:req.user._id}]});
    if (!chat) {
        return next(new Error("chat not found", { cause: 400 }))
    }
    return res.status(200).json({ msg: "done", chat });
})