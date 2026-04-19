import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
import { Message } from '../models/message.model.js'
import {getIO,userSocketMap} from '../socket/socket.js'
import mongoose from 'mongoose'


const getUsersForSidebar = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    if(!userId){
        throw new ApiError(404,"User not found")
    }
    const users = await User.find({_id : {$ne: userId}}).select("-password -refreshToken -email -bio")
    const unreadCounts  = await Message.aggregate([
        //Using aggregation avoids N+1 query problems and significantly improves performance compared to iterative querying
        {
            $match : {
                receiver : req.user._id,
                isSeen : false
            }
        },
        {
            $group : {
                _id : '$sender',
                count : {$sum : 1}   //They exist only in result 
                                    //Not stored in DB 
            }
        }
    ])
    //We store _id and unread message count in a MAP
    const unreadMap = new Map()
    unreadCounts.forEach(item => {
        unreadMap.set(item._id.toString(),item.count)
    });
    //Here we merge the unread count with user
    const usersWithUnread = users.map(user=>({
        ...user.toObject(),
        unreadCount : unreadMap.get(user._id.toString()) || 0
    }))

    return res.status(200).json(
    new ApiResponse(
      200,
      usersWithUnread,
      "Sidebar users fetched successfully"
    )
  );

})
//get all messages from selected user
const getMessages = asyncHandler(async(req,res)=>{
    // We fetch conversation using a bidirectional query with $or to include both sender and receiver messages.”



    const receiverId = req.params.id?.trim();
    // console.log("RAW ID 👉", receiverId);
    // console.log("TYPE 👉", typeof receiverId);
    // console.log("LENGTH 👉", receiverId?.length);
    const senderId = req.user._id
    if(!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)){
        throw new ApiError(400,"Invalid receiver ID")
    }
    const messages = await Message.find({
        $or : [
            {sender : senderId , receiver : receiverId},
            {sender : receiverId , receiver : senderId}
        ]
    })
    .sort({createdAt : 1})
    .select("-__v")


      // ================= MARK AS SEEN =================
    await Message.updateMany(
        {
            sender: receiverId, //Find all messages where theses conditions are folllowed
            receiver: senderId,
            isSeen: false
        },
        {
            $set: { isSeen: true }
        }
    );
    return res.status(200).json(
        new ApiResponse(
        200,
        messages,
        "Messages fetched successfully"
        )
    );
})

// api to mark message as seen using message id
const markMessageAsSeen = asyncHandler(async (req, res) => {
    // ================= GET ID =================
    const { messageId } = req.params;

    // ================= VALIDATION =================
    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
        throw new ApiError(400, "Invalid message ID");
    }

    // ================= UPDATE =================
    const message = await Message.findByIdAndUpdate(
        messageId,
        {
        $set: { isSeen: true }
        },
        { new: true }
    );

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // ================= RESPONSE =================
    return res.status(200).json(
        new ApiResponse(
        200,
        message,
        "Message marked as seen"
        )
    );
});

const sendMessage = asyncHandler(async (req, res) => {

    const message = req.body?.message || "";
    const receiverId = req.params.id?.trim();  // ✅ correct
    const senderId = req.user._id;
    

    // ================= VALIDATION =================
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
        throw new ApiError(400, "Invalid receiver ID");
    }

    if (!req.file && (!message || message.trim() === "")) {
  console.log("❌ VALIDATION FAILED", { message, file: req.file });
  throw new ApiError(400, "Message or image is required");
}
    
    let media = {
        url: "",
        public_id: ""
    };

    // ================= IMAGE UPLOAD =================
    if (req.file?.path) {
        const uploaded = await uploadOnCloudinary(req.file.path);

        if (!uploaded) {
        throw new ApiError(400, "Image upload failed");
        }

        media.url = uploaded.secure_url ;
        media.public_id = uploaded.public_id;
    }

    // ================= CREATE MESSAGE =================
    const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        message: message || "",
        media,
        isSeen: false
    });
    // ================= SOCKET EMIT =================
    const io = getIO();

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }


    // ================= RESPONSE =================
    return res.status(201).json(
        new ApiResponse(
        201,
        newMessage,
        "Message sent successfully"
        )
    );
});

export {getUsersForSidebar,getMessages,markMessageAsSeen,sendMessage}
