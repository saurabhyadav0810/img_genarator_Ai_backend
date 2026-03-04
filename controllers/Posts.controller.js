import post from "../models/Posts.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import createError from "../error.js";
import cloudinary from "../config/cloudinary.js";
dotenv.config();

export const getAllPosts = async (req, res, next) => {
    try {
        const posts = await post.find({});
      return res.status(200).json({
            success: true,
            data: posts,
        });
    } catch (error) {
        next(createError(error.status || 500, error.message));
    }
}


export const createPost = async (req, res, next) => {
    try {
        const { prompt, photo } = req.body;

    
        const user = await User.findById(req.userId);
        if (!user) return next(createError(404, "User not found"));

        const photoUrl = await cloudinary.uploader.upload(photo);
        const newPost = await post.create({
            name: user.name,
            username: user.username,
            prompt,
            photo: photoUrl.secure_url,
        });
        return res.status(201).json({
            success: true,
            data: newPost,
        }); 
    }
    catch (error) {
        next(createError(error.status || 500, error.message));
        }
}
