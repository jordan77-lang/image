# API Configuration Guide

## Setting Up Your Accessibility Bot API

Your site now includes interactive functionality that can connect to an accessibility bot API. Here's how to configure and deploy it:

### 1. API Endpoint Configuration

In `app.js`, update the `API_CONFIG` object with your actual API details:

```javascript
const API_CONFIG = {
    endpoint: 'https://your-api-endpoint.com/api', // Replace with your actual API endpoint
    apiKey: 'your-api-key-if-required' // Add your API key if required, or leave as null
};
```

### 2. API Implementation Options

#### Option A: OpenAI API Integration
Create a serverless function (Vercel, Netlify, or AWS Lambda) that uses OpenAI's API:

```javascript
// Example serverless function
export default async function handler(req, res) {
    const { image, context, type } = req.body;
    
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Generate ${type} for this image. Context: ${context}`
                    },
                    {
                        type: "image_url",
                        image_url: { url: image }
                    }
                ]
            }
        ]
    });
    
    res.json({
        altText: response.choices[0].message.content,
        longDescription: "..." // Process based on type
    });
}
```

#### Option B: Custom GPT Integration
If you have a Custom GPT, you can use the ChatGPT API (when available) or create a wrapper service.

#### Option C: Self-hosted Solution
Deploy your own AI model using:
- Flask/FastAPI with Hugging Face models
- Node.js with TensorFlow.js
- Docker container with your preferred ML framework

### 3. Expected API Endpoints

Your API should provide these endpoints:

- `POST /api/generate-alt-text`
- `POST /api/generate-long-description`  
- `POST /api/generate-descriptions` (for both)

### 4. Request/Response Format

**Request:**
```json
{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "context": "This chart shows student performance data",
    "type": "both"
}
```

**Response:**
```json
{
    "altText": "Bar chart showing math scores across grade levels",
    "longDescription": "A detailed description of the chart data..."
}
```

### 5. CORS Configuration

Make sure your API includes proper CORS headers:

```javascript
res.setHeader('Access-Control-Allow-Origin', 'https://jordan77-lang.github.io');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### 6. Testing Locally

For local development, you can:

1. Set up a local server on `http://localhost:3000`
2. Update the API endpoint in `app.js`
3. Ensure CORS is configured for localhost
4. Test with your GitHub Pages site

### 7. Deployment Steps

1. Deploy your API to your chosen platform
2. Update the `API_CONFIG.endpoint` in `app.js`
3. Add any required API keys to the configuration
4. Test the integration
5. Commit and push changes to GitHub
6. Your GitHub Pages site will automatically update

### 8. Fallback to GPT Link

The site includes a fallback option that links to your Custom GPT. Users can choose between:
- The integrated API tool (instant results)
- The ChatGPT interface (requires ChatGPT account)

### Security Notes

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Implement rate limiting on your API
- Validate file uploads (size, type)
- Consider implementing user authentication if needed
