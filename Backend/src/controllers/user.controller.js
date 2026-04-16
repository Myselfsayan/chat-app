import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
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
    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // ================= CHECK EXISTING USER =================
    const existedUser = await User.findOne({
        $or: [{ email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // ================= FILE HANDLING =================
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // ================= UPLOAD =================
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // ================= CREATE USER =================
    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        password,
        avatar: avatar.url,
        bio: bio || ""
    });

    // ================= REMOVE SENSITIVE DATA =================
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    // ================= RESPONSE =================
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
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
        secure: true,        // ⚠️ make false in local if no HTTPS
        sameSite: "strict"
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
            refreshToken: 1   // remove refresh token
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
        secure: false,       // ⚠️ true in production (HTTPS)
        sameSite: "strict"
    };

    // ================= RESPONSE =================
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});
const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // delete old image 
    if (user?.avatar) {
    const publicId = user.avatar.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
    }
    //Upload new image
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})
const updateAccountDetails = asyncHandler(async(req, res) => {
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
        const {accessToken,newRefreshToken} = await generateAccessandRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
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