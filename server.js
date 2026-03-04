import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import cloudinary from './config/cloudinary.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

import app from "./app.js";
import initializeSocket from './socket/socket.js';

const PORT = 3000;

const server = createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});