import axios from "axios";

export const generateAiImage = async (req, res, next) => {
    try {
        const { prompt } = req.body;

        // Using Hugging Face FLUX.1-schnell via new router endpoint
        const response = await axios.post(
            "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            { inputs: prompt },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    Accept: "image/png",
                },
                responseType: "arraybuffer",
                timeout: 60000,
            }
        );

        const base64Image = Buffer.from(response.data).toString("base64");

        return res.status(200).json({
            success: true,
            photo: `data:image/png;base64,${base64Image}`,
        });
    } catch (error) {
        console.error("HuggingFace Error:", error.response?.status, error.message);
        return res.status(500).json({
            success: false,
            message: "Image generation failed. " + error.message,
        });
    }
};
