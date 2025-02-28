import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: [{
        message: {
            type: String,
            required: true,
            trim: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }]
},{
    timestamps: true
});

export const chatModel = mongoose.models.Chat || mongoose.model("Chat", chatSchema);