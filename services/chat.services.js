import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

export const getOrCreateConversation = async (user1, user2) => {
   
    if (!mongoose.Types.ObjectId.isValid(user1) || !mongoose.Types.ObjectId.isValid(user2)) {
        throw new Error("Invalid user ID");
    }
    
    let conversation = await Conversation.findOne({ participants: { $all: [user1, user2] } });
    if (!conversation) {
        conversation = await Conversation.create({ participants: [user1, user2] });
    }
    return conversation;
};