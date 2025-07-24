// src/controllers/itineraryController.ts
import { Request, Response } from 'express';
import { aiItineraryRequestSchema } from '../shared/schema';
import dummyItenaries from '../data/dummyItenaries.json';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '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',
  defaultHeaders: {
    'HTTP-Referer': 'https://your-site-url.com',  // Replace with your domain if available
    'X-Title': 'TravelPlannerAI',                 // Your app title
  },
});

export const itineraryController = {
  generateItinerary: async (
    req: Request<{}, {}, {
      destination: string;
      startDate: string;
      endDate: string;
      preferences?: object;
      destinations?: object[];
      transportationOptions?: object[];
    }>,
    res: Response
  ): Promise<void> => {
    try {
      const validatedData = aiItineraryRequestSchema.parse(req.body);

      const prompt = `
Create a travel itinerary based on:
- Destination: ${validatedData.destination}
- Dates: ${validatedData.startDate} to ${validatedData.endDate}
- Preferences: ${JSON.stringify(validatedData.preferences || {})}
- Custom destinations: ${JSON.stringify(validatedData.destinations || [])}
- Transportation: ${JSON.stringify(validatedData.transportationOptions || [])}

Respond with JSON only (inside \`\`\`json block), like this:
\`\`\`json
{
  "destination": "Name",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "8:00 AM - 10:00 AM",
          "title": "Visit XYZ",
          "description": "Some detail...",
          "location": "Place",
          "cost": "$10",
          "category": "morning",
          "booked": false
        }
      ]
    }
  ]
}
\`\`\`
`;

      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are an expert travel planner." },
          { role: "user", content: prompt }
        ]
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI did not return any itinerary");

      // ✅ Extract JSON safely from Markdown if wrapped in ```json
      const match = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonText = match ? match[1].trim() : content.trim();

      const itinerary = JSON.parse(jsonText);
      res.status(200).json(itinerary);

    } catch (error: any) {
      if (error?.message?.includes('Unexpected token')) {
        res.status(500).json({ message: "AI returned invalid JSON format" });
      } else {
        res.status(500).json({ message: error.message || "Something went wrong" });
      }
    }
  }
};
