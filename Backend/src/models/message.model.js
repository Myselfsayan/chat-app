import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    message: {
        type: String,
        trim: true,
        maxlength: 1000
    },

    // 🔥 For media (image, file, etc.)
    media: {
        url: {
        type: String,
        default: ""
        },
        public_id: {
        type: String,
        default: ""
        }
    },

    // 🔥 Message status
    isSeen: {
        type: Boolean,
        default: false
    },


    },
    {
        timestamps: true
    }
);

export const Message = mongoose.model("Message", messageSchema);