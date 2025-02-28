import { Server } from "socket.io";
import { jobModel,chatModel } from './../../DB/models/index.js';

// Store HR user socket connections
const hrSockets = new Map(); // Map HR user IDs to their socket IDs

export const runIo = (httpServer) => {
    const io = new Server(httpServer, { cors: { origin: "*" } });
    
    io.on("connection", async (socket) => {
        socket.on("sendMessage", (data) => {
            const { userId, reciverId,jobId,content } = data;
            socket.broadcast.emit("sendMessage",async ()=>{
                const job = await jobModel.findOne({ _id: jobId }).populate([{ path: "companyId" }]);
                if (!job) {
                    return "job not found"
                }
                let chat;
                if(job.companyId.HRs.includes(userId)){
                    chat = await chatModel.findOne({$or:[{senderId:userId,reciverId:reciverId},{reciverId:userId,senderId:reciverId}]});
                    if (!chat) {
                        chat = await chatModel.create({senderId:userId,reciverId:reciverId});
                    }
                    await chatModel.updateOne({_id:chat._id},{$push:{message:{message:content,senderId:userId}}},{new:true})
                    return {message:content}
                }
                else{
                    chat = await chatModel.findOne({$or:[{senderId:userId,reciverId:job.companyId._id},{reciverId:userId,senderId:job.companyId._id}]});
                    if (!chat) {
                        return "chat not found"
                    };
                    await chatModel.updateOne({_id:chat._id},{$push:{message:{message:content,senderId:userId}}},{new:true})
                    return {message:content}
                }
                if (!chat) {
                    return "chat not found"
                };
            })
        })
    });
    return io;
};

//notify HR about new application
export const notifyHRAboutApplication = (io, hrId, applicationData) => {
    const socketId = hrSockets.get(hrId.toString());
    if (socketId) {
        io.to(socketId).emit('new-application', {
            message: 'A new application has been submitted',
            application: applicationData
        });
        console.log(`Notification sent to HR ${hrId}`);
        return true;
    } else {
        console.log(`HR ${hrId} is not currently connected`);
        return false;
    }
};
