import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6
    },

    avatar: {
    url: String,
    public_id: String
  },

    bio: {
      type: String,
      default: "",
      maxlength: 200
    },

    // 🔥 Chat specific fields
    isOnline: {
      type: Boolean,
      default: false
    },

    lastSeen: {
      type: Date,
      default: Date.now
    },

    socketId: {
      type: String // for realtime socket connection
    },


    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);


// ================= PASSWORD HASH =================
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// ================= PASSWORD CHECK =================
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


// ================= ACCESS TOKEN =================
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};


// ================= REFRESH TOKEN =================
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};


// ================= SAFE JSON =================
// password & refreshToken hide in API response
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};


// ================= MODEL EXPORT =================
export const User = mongoose.model("User", userSchema);