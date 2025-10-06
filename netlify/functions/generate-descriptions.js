const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { image, context, type } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image data is required' }),
      };
    }

    // Create prompts based on type
    let prompt = '';
    
    if (type === 'both') {
      prompt = `Generate both alt text and a long description for this image.

1. Alt Text (under 150 characters): Concise description of essential visual information
2. Long Description: Detailed description of all visual elements

${context ? `Context: This image is used in ${context}` : ''}

Format your response as:
ALT TEXT: [your alt text here]
LONG DESCRIPTION: [your long description here]`;
    } else if (type === 'alt-text') {
      prompt = `Generate a concise, descriptive alt text for this image. The alt text should be under 150 characters and describe the essential visual information. ${context ? `Context: This image is used in ${context}` : ''}`;
    } else if (type === 'long-description') {
      prompt = `Generate a detailed long description for this image. ${context ? `Context: This image is used in ${context}` : ''}`;
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    let errorMessage = 'Failed to process image. Please try again.';
    let statusCode = 500;
    
    if (error.code === 'insufficient_quota') {
      errorMessage = 'API quota exceeded. Please check your OpenAI billing.';
      statusCode = 429;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid API key. Please check your OpenAI API key.';
      statusCode = 401;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};
