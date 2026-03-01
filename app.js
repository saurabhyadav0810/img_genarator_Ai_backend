import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import PostRouter from './routes/Posts.route.js';
import { generateImageRouter } from './routes/GenerateAiImage.route.js';
const app = express();
connectDB();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true}));
app.use("/api/posts", PostRouter);
app.use("/api/generate", generateImageRouter);
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.get  ("/", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to img generator AI",

  });
}
);

export default app;
