// import axios from 'axios';
// import dotenv from 'dotenv';

// dotenv.config();

// const generateAIResponse = async (userInput: string) => {
//     const apiKey = process.env.AI_API_KEY;
//     const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

//     try {
//         const response = await axios.post(
//             apiEndpoint,
//             {
//                 model: 'gpt-4o-mini',
//                 messages: [{ role: 'user', content: userInput }],
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${apiKey}`,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         return response.data.choices[0].message.content;
//     } catch (error: any) {
//         console.error('AI Error:', error.response?.data || error.message);
//         throw new Error('Failed to generate AI response');
//     }
// };

// export const AIService = {
//     generateAIResponse,
// };
