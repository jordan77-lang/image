const { OpenAI } = require('openai');

// Built-in reference materials for Dreamscape Learn standards
const DREAMSCAPE_STANDARDS = `DREAMSCAPE LEARN ACCESSIBILITY STANDARDS

This document provides institutional standards for creating accessible image content that aligns with Dreamscape Learn curriculum requirements.

=== ALT TEXT STANDARDS ===

Character Limit: 120 characters maximum
- Count only visible characters (letters, numbers, punctuation, spaces)
- Do not count quotation marks unless part of actual alt text

Language Requirements:
- Use active voice and present tense
- Use "to" instead of hyphens in numeric ranges (e.g., "5 to 6" not "5-6")
- Spell out all units in full (e.g., "milligrams per liter" not "mg/L")
- Use "frequency distribution" instead of "bar chart" or "histogram"

Content Guidelines:
- Describe only what is visually present
- Include essential visual information for understanding
- Avoid redundant phrases like "image of" or "picture showing"
- Focus on educational content and key data points

=== FIGURE DESCRIPTION STANDARDS ===

Structure (Kroodsma Style):
1. Begin with take-home message (main finding or insight)
2. Follow with supporting details giving clear context
3. Include variables, comparisons, patterns and their connections
4. Make description stand-alone and fully communicative

Requirements:
- Use full sentences, no fragments or bullet points
- Keep language plain and accessible
- Explain what relationships mean, don't just list what figure shows
- Length: 1-3 sentences (typically up to 50 words, but may exceed for clarity)
- Always begin with "Figure #." placeholder for numbering
- Do NOT end with generic purpose sentences like "This figure allows you to evaluate..."

Examples:
- Good: "Figure 2. Arsenic's position in the periodic table reveals its chemical reactivity and similarity to nearby elements."
- Poor: "Figure 2. Periodic table with arsenic highlighted."

=== LONG DESCRIPTION STANDARDS ===

Format:
- Always begin with: "This image is a [type] showing..."
- Use plain language and short clauses
- Emphasize educational takeaway: trend, relationship, or concept the image teaches

Content Requirements:
- Focus on educational significance and learning objectives
- Use "to" for numeric ranges instead of hyphens
- Spell out all units in full (no abbreviations)
- Use "frequency distribution" not "bar chart" or "histogram"
- Never restate paragraph text or captions

=== TRANSCRIBED TEXT STANDARDS ===

Accuracy:
- Transcribe all visible text in logical reading order
- Preserve spelling, capitalization, punctuation, and unit abbreviations exactly as shown
- Include axis labels, legends, titles, and data values

Special Cases:
- For frequency distributions: List each bin's range exactly as shown followed by bar height
- Put each "range: frequency" pair on separate line
- Include bins with zero height if labeled on axis
- If no text visible, write "No text visible in image"

=== FIGURE LEGENDS BEST PRACTICES ===

Primary Purpose:
- Make figures accessible to all students including those with visual impairments
- Provide context that helps students interpret data and understand concepts
- Support learning objectives through clear, structured descriptions

Structure:
1. Start with figure type and main subject
2. Describe key visual elements and data patterns
3. Explain educational significance or relationship shown
4. Include specific data points when relevant for learning

Language Guidelines:
- Use descriptive, specific language
- Avoid vague terms like "shows" or "depicts" without detail
- Include quantitative information when educationally relevant
- Connect visual elements to course concepts`;

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
    const { image, context, referenceDocument } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image data is required' }),
      };
    }

    // Combine built-in standards with any additional reference document
    let combinedReferences = DREAMSCAPE_STANDARDS;
    if (referenceDocument && referenceDocument.trim()) {
      combinedReferences += '\n\n=== ADDITIONAL CONTEXT ===\n\n' + referenceDocument;
    }

    // Create comprehensive prompt for all four sections
    const prompt = `You are an expert in creating accessible educational content for Dreamscape Learn curriculum. Generate accessibility content for this image following our institutional standards.

REFERENCE MATERIALS:
${combinedReferences}

USER CONTEXT: ${context || 'No additional context provided'}

Generate exactly four sections:

1. **Alt Text** (120 characters max): Brief description for screen readers
2. **Figure Description**: Kroodsma-style description starting with take-home message  
3. **Long Description**: Comprehensive description starting with "This image is a..."
4. **Transcribed Text**: All visible text in logical reading order

Follow all standards exactly as specified in the reference materials above.`;

    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { 
              type: 'image_url', 
              image_url: { url: image } 
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const result = response.choices[0].message.content;

    // Parse the result into sections
    const sections = {};
    
    // Extract Alt Text
    const altMatch = result.match(/\*\*Alt Text.*?\*\*[:\s]*(.*?)(?=\n\*\*|\n\n|\n[0-9]\.|\n[a-zA-Z]|$)/s);
    if (altMatch) {
      sections.altText = altMatch[1].trim();
    }

    // Extract Figure Description  
    const figureMatch = result.match(/\*\*Figure Description.*?\*\*[:\s]*(.*?)(?=\n\*\*|\n\n|\n[0-9]\.|\n[a-zA-Z]|$)/s);
    if (figureMatch) {
      sections.figureDescription = figureMatch[1].trim();
    }

    // Extract Long Description
    const longMatch = result.match(/\*\*Long Description.*?\*\*[:\s]*(.*?)(?=\n\*\*|\n\n|\n[0-9]\.|\n[a-zA-Z]|$)/s);
    if (longMatch) {
      sections.longDescription = longMatch[1].trim();
    }

    // Extract Transcribed Text
    const transcribedMatch = result.match(/\*\*Transcribed Text.*?\*\*[:\s]*(.*?)(?=\n\*\*|\n\n|\n[0-9]\.|\n[a-zA-Z]|$)/s);
    if (transcribedMatch) {
      sections.transcribedText = transcribedMatch[1].trim();
    }

    // Calculate character counts
    const counts = {
      altText: sections.altText ? sections.altText.length : 0,
      figureDescription: sections.figureDescription ? sections.figureDescription.length : 0,
      longDescription: sections.longDescription ? sections.longDescription.length : 0,
      transcribedText: sections.transcribedText ? sections.transcribedText.length : 0
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        sections,
        counts,
        rawResponse: result
      }),
    };

  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = 'An error occurred processing your request';
    let statusCode = 500;
    
    if (error.message === 'MISSING_API_KEY') {
      errorMessage = 'OpenAI API key not configured';
      statusCode = 500;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key';
      statusCode = 401;
    } else if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded';
      statusCode = 429;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        details: error.message 
      }),
    };
  }
};
