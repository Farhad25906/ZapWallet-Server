import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const generateAIResponse = async (userInput: string) => {
    const apiKey = process.env.AI_API_KEY;
    // Using v1beta for better system instruction support
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const zapWalletContext = `
You are the official ZapWallet AI Assistant. ZapWallet is a robust, secure, and production-ready digital payment ecosystem similar to bKash. 

Key Features:
- 💸 Send Money: Transfer funds between users safely (৳100 - ৳1,000,000).
- 🏦 Cash In & Cash Out: Secure deposits and withdrawals through authorized Agents.
- 🔐 Security: Includes PIN-based transactions, JWT auth, Bcrypt hashing, and SMS OTP via Twilio.
- 👥 Role-Based Access: Dedicated dashboards for Users, Agents, and Super Admins.
- ⚡ Tech Stack: Built with React 19, Node.js, Express, MongoDB, and Redis.
- 👨‍💻 Created by: Farhad Hossen.

Be helpful, professional, and focus on providing information about ZapWallet's services.
`;

    try {
        const response = await axios.post(
            apiEndpoint,
            {
                systemInstruction: {
                    parts: [{ text: zapWalletContext }]
                },
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
