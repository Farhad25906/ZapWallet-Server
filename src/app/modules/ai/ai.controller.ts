import { Request, Response } from 'express';
import { AIService } from './ai.service';

const chatWithAI = async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
            success: false,
            message: 'Prompt is required',
        });
    }

    try {
        console.log('--- AI Chat Request ---');
        console.log('User Prompt:', prompt);

        const result = await AIService.generateAIResponse(prompt);

        console.log('AI Response:', result);
        console.log('-----------------------');

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Something went wrong',
        });
    }
};

export const AIController = {
    chatWithAI,
};
