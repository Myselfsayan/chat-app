import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
import { deleteFromCloudinary } from '../utils/cloudinary.js'
import mongoose from 'mongoose'


const generateAccessandRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(404,"User not found")
        }
            const accessToken = user.generateAccessToken()
            
            const refreshToken = user.generateRefreshToken()

            user.refreshToken = refreshToken;
            await user.save({validateBeforeSave : false})

            return {accessToken , refreshToken}

    } catch (error) {
        //console.log("TOKEN GENERATION ERROR:", error)
        throw new ApiError(500,"Something went wrong while generating Access and Refresh token")
    }
}
const registerUser = asyncHandler(async (req, res) => {

    // ================= INPUT =================
    const { fullName, email, password, bio } = req.body;

    // ================= VALIDATION =================
    if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
        throw new ApiError(400, "Full name, email and password are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // ================= CHECK EXISTING USER =================
    const existedUser = await User.findOne({
        email: email.toLowerCase()
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists with this email");
    }

    // ================= AVATAR HANDLING =================
    let avatar = null;

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (avatarLocalPath) {
        try {
            const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

            if (uploadedAvatar?.secure_url) {
                avatar = {
                    url: uploadedAvatar.secure_url,
                    public_id: uploadedAvatar.public_id
                };
            }
        } catch (error) {
            console.log("Avatar upload failed, skipping avatar");
        }
    }

    // ================= CREATE USER =================
    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        password,
        avatar,
        bio: bio || ""
    });

    // ================= GENERATE TOKENS =================
    const { accessToken, refreshToken } =
        await generateAccessandRefreshTokens(user._id);

    // ================= UPDATE STATUS =================
    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });

    // ================= SANITIZE =================
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // ================= COOKIE OPTIONS =================
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    // ================= RESPONSE =================
    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken
                },
                "User registered successfully"
            )
        );
});
const loginUser = asyncHandler(async (req, res) => {

    // ================= INPUT =================
    const { email, password } = req.body;

    // ================= VALIDATION =================
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // ================= FIND USER =================
    const user = await User.findOne({
        email: email.toLowerCase()
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // ================= PASSWORD CHECK =================
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // ================= GENERATE TOKENS =================
    const { accessToken, refreshToken } =
        await generateAccessandRefreshTokens(user._id);

    // ================= UPDATE CHAT STATUS =================
    user.isOnline = true;
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });

    // ================= REMOVE SENSITIVE DATA =================
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // ================= COOKIE OPTIONS =================

        const options = {
        httpOnly: true,
        secure: true,        // ✅ REQUIRED for HTTPS
        sameSite: "none"     // ✅ REQUIRED for cross-origin
        };
        

    // ================= RESPONSE =================
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
        new ApiResponse(
            200,
            {
            user: loggedInUser,
            accessToken,
            refreshToken
            },
            "User logged in successfully"
        )
        );
});
const logoutUser = asyncHandler(async (req, res) => {
    // ================= UPDATE USER =================
    await User.findByIdAndUpdate(
        req.user._id,
        {
        $unset: {
            refreshToken: null   // remove refresh token
        },
        $set: {
            isOnline: false,  // 🔥 chat feature
            lastSeen: Date.now()
        }
        },
        {
        new: true
        }
    );

    // ================= COOKIE OPTIONS =================
    const options = {
    httpOnly: true,
    secure: true,        // ✅ REQUIRED for HTTPS
    sameSite: "none"     // ✅ REQUIRED for cross-origin
    };

    // ================= RESPONSE =================
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // ✅ STEP 1: get user FIRST
    const existingUser = await User.findById(req.user?._id);

    if (!existingUser) {
        throw new ApiError(404, "User not found");
    }

    // ✅ STEP 2: delete old avatar if exists
    if (existingUser.avatar?.public_id) {
    await deleteFromCloudinary(existingUser.avatar.public_id);
}

    // ✅ STEP 3: upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.secure_url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    // ✅ STEP 4: update user
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: {
                    url: avatar.secure_url,   // ✅ Use secure_url (https://) to avoid Mixed Content
                    public_id: avatar.public_id
                }
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Avatar updated successfully")
    );
});
const updateAccountDetails = asyncHandler(async(req, res) => {
    console.log("BODY:", req.body);
    const {fullName, bio} = req.body
    

    if (!fullName || !bio) {
        throw new ApiError(400, "All fields are required")
    }
    if(!req.user?._id){
        throw new ApiError(401, "Unauthorized Request")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                bio
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
        const options = {
            httpOnly : true,
            secure : true
        }
        const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken},
                "Accesstoken refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})
// ================= CHECK AUTH CONTROLLER =================
const checkAuth = (req, res) => {
    return res.status(200).json({
        success: true,
        user: req.user,
    });
};

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateAccountDetails,
    updateUserAvatar,
    checkAuth
}