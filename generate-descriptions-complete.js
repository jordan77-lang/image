const { OpenAI } = require('openai');

// Simple file-based reference storage (for demo - would use database in production)
const fs = require('fs').promises;
const path = require('path');

// Initialize with some default reference content
const DEFAULT_REFERENCES = `DREAMSCAPE LEARN ACCESSIBILITY STANDARDS

=== ALT TEXT STANDARDS ===
- Character Limit: 120 characters maximum
- Use active voice and present tense
- Use "to" instead of hyphens in numeric ranges (e.g., "5 to 6")
- Spell out all units in full (e.g., "milligrams per liter" not "mg/L")
- Use "frequency distribution" instead of "bar chart" or "histogram"

=== FIGURE DESCRIPTION STANDARDS ===
- Begin with take-home message (main finding or insight)
- Use Kroodsma style: supporting details follow opening message

- Do NOT end with generic purpose sentences

=== EXAMPLES ===
Good Alt Text: "Graph showing enzyme activity from 20 to 80 degrees Celsius with peak at 37 degrees"
Good Figure Description: "Arsenic's position in the periodic table reveals its chemical reactivity and similarity to nearby elements."`;

let openai;
function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('MISSING_API_KEY');
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

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
    const started = Date.now();
    const requestId = Math.random().toString(36).slice(2,10);
    const rawBody = event.body;
    let parsed;
    try {
      parsed = JSON.parse(rawBody || '{}');
    } catch(parseErr) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body', detail: parseErr.message }) };
    }
    const { image, context, type = 'both' } = parsed;

    // Basic validation
    if (!image || typeof image !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Image (base64 or URL) is required as a string.' }) };
    }
    if (!/^data:image\//.test(image) && !/^https?:\/\//.test(image)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Image must be a data URL or an https URL.' }) };
    }
    if (!['both','alt-text','long-description'].includes(type)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid type. Use one of: both, alt-text, long-description' }) };
    }
    if ((image.length/1024/1024) > 7) { // rough size guard
      return { statusCode: 413, headers, body: JSON.stringify({ error: 'Image payload too large (>7MB).' }) };
    }

    // Ensure client & key
    const client = getClient();

    // Create prompts based on type with permanent reference materials
    const permanentReferences = `\n\n=== INSTITUTIONAL REFERENCE MATERIALS ===\nAlways align your output with these institutional standards:\n\n${DEFAULT_REFERENCES}`;
    
    let prompt = '';
    
    if (type === 'both') {
      prompt = `You are a tool used by the Dreamscape Learn curriculum team to generate accessible image descriptions for educational content. Describe ONLY what is visually present. Do not guess, infer, interpret, or reuse content.

Generate all four sections:

1. Alt Text (Character Count: #)
- Must be 120 characters or fewer
- Count only visible characters: letters, numbers, punctuation, spaces
- Include accurate character count using format: Alt Text (Character Count: #)
- Use "to" instead of hyphens in numeric ranges (e.g., 5 to 6)
- Spell out all units in full (no abbreviations like mg/L)

2. Figure Description (Kroodsma style — interpretive)
- Begin with the take-home message: a clear, interpretive statement of the main idea or conclusion the image demonstrates.
- Then give supporting evidence: one or two concise sentences that explain the visual relationships, trends, or representative values that justify the take-away.
- End with significance: one sentence that explains why this result matters or how it will be used.
- Do not open with "the figure shows" or "this diagram illustrates"; lead with the interpretation itself.
- Do not invent facts not present in the image. You may infer patterns, relationships, or numeric ranges visible in the image but do not assert unseen context (e.g., sample origin) unless text in the image supports it.
- Use neutral, present-tense, full sentences. No contractions. Avoid references to colors/positions like "the red line on the left"; instead say what that element means (e.g., "the sample with higher absorbance").
- Preferred structure: 1–3 short sentences (recommended: take-away, evidence, significance). Use more sentences only when complexity requires it.


3. Long Description
- Long description must begin with: "This image is a [type] showing..." for context.
- Then provide an interpretive paragraph that follows the Kroodsma structure: main takeaway → supporting evidence → significance.
- Use short clauses and plain language. You may include a concise numeric example or representative value if visible.
- Do not merely list visual elements; emphasize the meaning and how a reader should interpret the image for learning.


4. Transcribed Text
- Transcribe all visible text in logical reading order, exactly as it appears
- Preserve spelling, capitalization, punctuation, and unit abbreviations as shown
- For frequency distributions: list each bin's range exactly as shown followed by bar height
- Put each "range: frequency" pair on its own line, in the same order bars appear
- Include bins with zero height if they are labeled on the axis
- If no text is visible, write "No text visible in image"

${context ? `Context: This image is used in ${context}` : ''}

Format response as:
Alt Text (Character Count: #): [your alt text here]
Figure Description: [your figure description here]
Long Description: [your long description here]
Transcribed Text: [your transcribed text here]${permanentReferences}`;
    } else if (type === 'alt-text') {
      prompt = `You are a tool used by the Dreamscape Learn curriculum team to generate accessible alt text for educational content. Describe ONLY what is visually present.

Requirements:
- Must be 120 characters or fewer
- Count only visible characters: letters, numbers, punctuation, spaces
- Include accurate character count using format: Alt Text (Character Count: #)
- Use "to" instead of hyphens in numeric ranges (e.g., 5 to 6)
- Spell out all units in full (no abbreviations like mg/L)
- Use "frequency distribution" not "bar chart" or "histogram"

${context ? `Context: This image is used in ${context}` : ''}

Format response as:
Alt Text (Character Count: #): [your alt text here]${permanentReferences}`;
    } else if (type === 'long-description') {
      prompt = `You are a tool used by the Dreamscape Learn curriculum team to generate accessible long descriptions for educational content. Describe ONLY what is visually present.

Requirements:
- Begin with: "This image is a [type] showing..."
- Use plain language, short clauses
- Emphasize educational takeaway: trend, relationship, concept the image teaches
- Use "to" for numeric ranges instead of hyphens
- Spell out all units in full (no abbreviations)
- Use "frequency distribution" not "bar chart" or "histogram"
- Never restate paragraph text or captions

${context ? `Context: This image is used in ${context}` : ''}${permanentReferences}`;
    }

    let response;
    try {
      response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image, detail: "high" } }
            ]
          }
        ],
        max_tokens: 900,
        temperature: 0.6,
      });
    } catch (apiErr) {
      // Surface specific OpenAI style errors when possible
      if (apiErr.status === 401) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: invalid or missing API key.' }) };
      }
      if (apiErr.status === 429) {
        return { statusCode: 429, headers, body: JSON.stringify({ error: 'Rate limit or quota exceeded. Check billing & usage.' }) };
      }
      if (apiErr.status === 400) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad request to OpenAI: ' + (apiErr.error?.message || 'validation error') }) };
      }
      console.error('OpenAI upstream error', apiErr);
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream model error', detail: apiErr.message }) };
    }

    if (!response || !response.choices || !response.choices[0]?.message?.content) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Malformed response from OpenAI.' }) };
    }

    const content = response.choices[0].message.content;

    // Parse the response based on type
    let result = {};

    if (type === 'both') {
      // Parse alt text, figure description, long description, and transcribed text
      const altTextMatch = content.match(/Alt Text \(Character Count: \d+\):\s*(.+?)(?=\n|Figure Description:|$)/);
      const figureDescMatch = content.match(/Figure Description:\s*(.+?)(?=\n|Long Description:|$)/);
      const longDescMatch = content.match(/Long Description:\s*(.+?)(?=\n|Transcribed Text:|$)/);
      const transcribedMatch = content.match(/Transcribed Text:\s*([\s\S]+?)$/);
      
      result = {
        altText: altTextMatch ? altTextMatch[1].trim() : content.substring(0, 120),
        figureDescription: figureDescMatch ? figureDescMatch[1].trim() : '',
        longDescription: longDescMatch ? longDescMatch[1].trim() : content,
        transcribedText: transcribedMatch ? transcribedMatch[1].trim() : '',
        timestamp: new Date().toISOString()
      };
    } else if (type === 'alt-text') {
      const altTextMatch = content.match(/Alt Text \(Character Count: \d+\):\s*(.+?)$/);
      result = {
        altText: altTextMatch ? altTextMatch[1].trim() : content.trim(),
        timestamp: new Date().toISOString()
      };
    } else if (type === 'long-description') {
      result = {
        longDescription: content.trim(),
        timestamp: new Date().toISOString()
      };
    }

    const durationMs = Date.now() - started;
    return { statusCode: 200, headers, body: JSON.stringify({ ...result, meta: { requestId, durationMs, model: 'gpt-4o' } }) };

  } catch (error) {
    console.error('Handler fatal error:', error);
    if (error.message === 'MISSING_API_KEY') {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server missing OpenAI API key configuration.' }) };
    }
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error', detail: error.message }) };
  }
};
