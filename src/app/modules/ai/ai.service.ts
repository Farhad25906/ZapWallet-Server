import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const generateAIResponse = async (userInput: string) => {
    const apiKey = process.env.AI_API_KEY;
    // Using v1 endpoint and gemini-1.5-flash model (which shows available quota in your screenshot)
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    try {
        const response = await axios.post(
            apiEndpoint,
            {
                contents: [{
                    parts: [{ text: userInput }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extracting response from Gemini's candidate structure
        return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
        console.error('AI Error:', error.response?.data || error.message);
        throw new Error('Failed to generate AI response from Gemini');
    }
};

export const AIService = {
    generateAIResponse,
};
