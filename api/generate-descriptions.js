// Vercel serverless function for OpenAI API integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, context, type } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Create prompts based on type
    let prompt = '';
    
    if (type === 'alt-text' || type === 'both') {
      prompt = `Generate a concise, descriptive alt text for this image. The alt text should be under 150 characters and describe the essential visual information. ${context ? `Context: This image is used in ${context}` : ''}

Guidelines:
- Be concise and descriptive
- Don't start with "image of" or "picture of"
- Include any text visible in the image
- Focus on the most important visual elements
- Consider the educational context provided`;
    } else if (type === 'long-description') {
      prompt = `Generate a detailed long description for this image. This should be a comprehensive description that conveys all the visual information someone who cannot see the image would need. ${context ? `Context: This image is used in ${context}` : ''}

Guidelines:
- Provide detailed information about all visual elements
- Describe layout, colors, text, and relationships between elements
- Include all data points if it's a chart or graph
- Structure the description logically
- Make it accessible to screen reader users`;
    } else if (type === 'both') {
      prompt = `Generate both alt text and a long description for this image.

1. Alt Text (under 150 characters): Concise description of essential visual information
2. Long Description: Detailed description of all visual elements

${context ? `Context: This image is used in ${context}` : ''}

Format your response as:
ALT TEXT: [your alt text here]
LONG DESCRIPTION: [your long description here]`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    // Parse the response based on type
    let result = {};

    if (type === 'both') {
      // Parse both alt text and long description
      const altTextMatch = content.match(/ALT TEXT:\s*(.+?)(?=\n|LONG DESCRIPTION:|$)/);
      const longDescMatch = content.match(/LONG DESCRIPTION:\s*([\s\S]+?)$/);
      
      result = {
        altText: altTextMatch ? altTextMatch[1].trim() : content.substring(0, 150),
        longDescription: longDescMatch ? longDescMatch[1].trim() : content,
        timestamp: new Date().toISOString()
      };
    } else if (type === 'alt-text') {
      result = {
        altText: content.trim(),
        timestamp: new Date().toISOString()
      };
    } else if (type === 'long-description') {
      result = {
        longDescription: content.trim(),
        timestamp: new Date().toISOString()
      };
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'API quota exceeded. Please check your OpenAI billing.' 
      });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API key.' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to process image. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
