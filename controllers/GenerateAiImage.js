import dotenv from "dotenv";
import Groq from "groq-sdk";
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const generateAiImage = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        
        const message = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Generate a detailed description for an image based on this prompt: ${prompt}`,
                }
            ],
            model: "llama-3.3-70b-versatile",
        });
        
        const generatedText = message.choices[0].message.content;
        
        return res.status(200).json({
            success: true,
            photo: generatedText
        });
    } catch (error) {
        next(error);
    }
}
