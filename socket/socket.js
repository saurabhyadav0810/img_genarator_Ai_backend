import { Server } from 'socket.io';
import Message from '../models/Message.js';
import { getOrCreateConversation } from '../services/chat.services.js';

const initializeSocket = (server) => { 
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5155"],
            credentials: true
        }
    });
io.on("connection", (socket) => {
    console.log("Socket.IO connection established:", socket.id);

    socket.on("register", (userId) => {
        if(!userId) return;
        socket.join(userId.toString());
        console.log(` User registered - DB ID: ${userId} | Socket ID: ${socket.id}`);
    });

    socket.on("typing", ({senderId, receiverId}) => {
        if(!receiverId) return;
        console.log(`  User ${senderId} is typing to ${receiverId}`);
        socket.to(receiverId.toString()).emit("typing", { senderId });
    });
socket.on("sendMessage", async (data) => {
    try {
        console.log("Message received:", data);
        const { senderId, receiverId, text } = data;
        if (!senderId || !receiverId || !text) return;

        const conversation = await getOrCreateConversation(senderId, receiverId);

        const message = await Message.create({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            text,
            status: "sent"
        });

        conversation.lastMessage = message._id;
        await conversation.save();

        console.log(`Sending message from ${senderId} to ${receiverId}`);
        socket.to(receiverId.toString()).emit("receive_message", message);
        socket.emit("message_sent", message);
    }
    catch (error) {
        socket.emit("message_error", { message: "Unable to send message" });
        console.error("Socket error:", error);
    }
});

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});
}
export default initializeSocket;