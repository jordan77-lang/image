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
- NEVER use unit abbreviations - always spell out all units in full (e.g., "milligrams per liter" not "mg/L", "degrees Celsius" not "°C", "percent" not "%")
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
- Begin directly with the educational significance or main finding
- Do NOT end with generic purpose sentences like "This figure allows you to evaluate..."

Examples:
- Good: "Arsenic's position in the periodic table reveals its chemical reactivity and similarity to nearby elements."
- Poor: "Periodic table with arsenic highlighted."

=== LONG DESCRIPTION STANDARDS ===

Format:
- Always begin with: "This image is a [type] showing..."
- Use plain language and short clauses
- Emphasize educational takeaway: trend, relationship, or concept the image teaches

Content Requirements:
- Focus on educational significance and learning objectives
- Use "to" for numeric ranges instead of hyphens
- NEVER use unit abbreviations - always spell out all units in full (e.g., "milligrams per liter" not "mg/L", "degrees Celsius" not "°C", "percent" not "%")
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
1. Start directly with the scientific content and main finding (NEVER with "Figure")
2. Describe key data patterns and relationships
3. Explain educational significance or scientific meaning
4. Include specific data points when relevant for learning

Language Guidelines:
- Use descriptive, specific language
- Avoid vague terms like "shows" or "depicts" without detail
- Include quantitative information when educationally relevant
- Connect visual elements to course concepts

=== KROODSMA'S FIGURE LEGEND PRINCIPLES ===

Based on "A Quick Fix for Figure Legends and Table Headings" by Donald Kroodsma:

Key Philosophy:
- Figure legends should tell the complete story of what the figure shows
- Readers should understand the main finding without reading the full text
- Lead with the take-home message, then provide supporting details

Effective Figure Legend Structure:
1. Start with the main finding or interpretation (the "so what?")
2. Provide context and methodology only as needed for understanding
3. Include specific details that support the main message
4. Make the legend self-contained and meaningful

Examples of Effective Approach:
- Instead of: "Graph showing enzyme activity at different temperatures"
- Write: "Enzyme activity peaks at body temperature (37°C), declining rapidly above 40°C"
- Instead of: "Bar chart of student test scores by study method"
- Write: "Students using active recall scored 23% higher than those using passive review"
- Instead of: "Ion peaks at 1.2, 1.5, and 3.8 milliseconds with tallest at 1.5 milliseconds"
- Write: "Ion mobility spectrum showing multiple compounds. By comparing drift times to reference values, the 1.2 ms peak corresponds to methanol, 1.5 ms to ethanol, and 3.8 ms to n-heptane. The tallest peak at 1.5 ms indicates ethanol is the most abundant compound in the sample."

FIGURE DESCRIPTION WRITING INSTRUCTIONS:

Purpose: Write clear, self-contained figure descriptions that explain what the figure means, how the data show it, and why it matters. Each description must let the reader understand the figure without referring to the main text.

Structure (typically three concise sentences):
1. Main message – State the key finding or overall trend the figure demonstrates. Lead with the main point rather than listing what appears in the image.
2. Supporting evidence – Describe the pattern, relationship, or comparison that supports the main message. Mention key variables or representative values. Avoid referring to colors, shapes, or positions.
3. Significance or interpretation – Explain the meaning or implication of the pattern. Connect it to the concept, process, or argument.

Style Guidelines:
- Use complete sentences in present tense
- Maintain neutral, factual, professional tone
- Avoid contractions and em dashes
- Do NOT begin with "Figure," "Fig.," or a number
- Focus on interpretation, not on how the figure looks
- Ensure description is stand-alone and logically ordered
- Keep concise and accessible for all readers

Quality Requirements:
✅ Includes main finding, supporting evidence, and significance
✅ Describes relationships or trends, not visual features
✅ Written in clear, neutral, present-tense language
✅ Does NOT begin with "Figure" or a number
✅ Can be understood without referring to main text

Guiding Principles:
• Lead with meaning - Begin with the main idea or finding
• Support with data - Summarize the relevant pattern or relationship
• End with context - Explain why the result matters
• Be self-contained - Make sense on its own
• Interpret, don't narrate - Describe what data mean, not shapes/colors

=== DSL WRITING AND COPYEDIT GUIDELINES ===

Based on Dreamscape Learn Writing and Copyedit Guidelines v4.15.252:

Language Standards:
- Use clear, concise, and accessible language appropriate for educational content
- Maintain consistency in terminology and style across all accessibility descriptions
- Follow active voice when possible for clarity and engagement
- Use present tense for describing visual elements and data

Technical Writing Requirements:
- Spell out units on first use, then use standard abbreviations consistently
- Use "to" instead of hyphens for ranges (e.g., "5 to 10" not "5-10")
- Maintain parallel structure in lists and descriptions
- Use specific, quantitative language when describing data

Educational Content Standards:
- Prioritize learning objectives in all descriptions
- Connect visual information to broader course concepts
- Use discipline-appropriate terminology accurately
- Ensure descriptions support pedagogical goals

Formatting and Style:
- Use sentence case for headings and labels
- Maintain consistent punctuation and capitalization
- Follow DSL's preferred spelling and usage conventions
- Ensure all text meets accessibility readability standards

Quality Assurance:
- Review all content for accuracy and clarity
- Verify consistency with DSL brand and voice guidelines
- Check that descriptions serve educational purposes effectively
- Ensure compliance with institutional accessibility standards

=== DSL STYLE GUIDE V2 STANDARDS ===

Based on Dreamscape Learn Style Guide V2 - Complete brand and style requirements:

Voice and Tone:
- Maintain professional yet approachable tone in all descriptions
- Use authoritative but accessible language appropriate for educational content
- Ensure consistency with DSL's established brand voice across all materials
- Balance technical accuracy with readability for diverse learner audiences

Terminology and Usage:
- Follow DSL's preferred terminology for scientific and educational concepts
- Use consistent capitalization for proper nouns and technical terms
- Apply DSL's specific style preferences for common educational phrases
- Maintain uniformity in how measurements, data, and statistics are presented

Content Structure and Organization:
- Follow DSL's hierarchical information presentation standards
- Use consistent formatting for similar types of content across descriptions
- Apply DSL's preferred approach to introducing and explaining complex concepts
- Ensure logical flow that supports DSL's pedagogical methodology

Brand Consistency Requirements:
- Align all accessibility content with DSL's educational philosophy
- Use language that reflects DSL's commitment to inclusive learning
- Maintain consistency with DSL's approach to scientific communication
- Ensure descriptions support DSL's overall curriculum objectives

Visual Content Guidelines:
- Follow DSL's standards for describing charts, graphs, and data visualizations
- Use DSL's preferred approaches for explaining visual relationships
- Apply consistent methodology for describing scientific illustrations
- Maintain DSL's standards for technical diagram explanations

Accessibility Integration:
- Ensure all descriptions meet DSL's accessibility compliance requirements
- Follow DSL's specific guidelines for inclusive content creation
- Apply DSL's standards for multi-modal learning support
- Maintain consistency with DSL's universal design principles

=== DSL SUMMARY OF STYLE - QUICK REFERENCE ===

Essential style points for immediate reference when generating accessibility content:

Key Writing Principles:
- Use clear, direct language that supports learning objectives
- Maintain active voice and present tense when describing visual elements
- Prioritize educational value in every description
- Ensure consistency across all content types

Critical Style Rules:
- Spell out units in full on first use (e.g., "milligrams per liter" not "mg/L")
- Use "to" for ranges instead of hyphens (e.g., "5 to 10" not "5-10")
- Apply sentence case for headings and labels consistently
- Use specific, quantitative language when describing data

Essential Format Requirements:
- Begin figure descriptions with main educational message
- Start long descriptions with "This image is a [type] showing..."
- Keep alt text under 120 characters while maintaining meaning
- Transcribe all visible text exactly as shown in logical reading order

Priority Guidelines:
- Educational significance takes precedence over visual description
- Support DSL's pedagogical approach in all content
- Maintain professional yet accessible tone throughout
- Ensure descriptions can stand alone as meaningful content

Quality Checkpoints:
- Does the description serve the learning objective?
- Is the language clear and accessible to the target audience?
- Does the content align with DSL's brand voice and standards?
- Are all technical requirements (character limits, format) met?`;

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
  console.log('🚨 FUNCTION CALLED - Figure numbering prevention ACTIVE v2.0');
  console.log('Deployment timestamp:', new Date().toISOString());
  
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
    const { image, imageData, context, referenceDocument, type } = JSON.parse(event.body);
    
    // Handle both parameter names for image data
    const finalImageData = image || imageData;

    if (!finalImageData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image (base64 or URL) is required as a string.' }),
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
2. **Figure Description**: Write INTERPRETIVE descriptions that explain scientific meaning.
   
   CRITICAL RULES:
   - NEVER start with "Figure", "The diagram shows", "This image illustrates"
   - Begin with the main scientific principle or finding
   - Explain how the elements support that principle
   - End with why it matters scientifically
   
   THREE-SENTENCE KROODSMA STRUCTURE:
   - SENTENCE 1: Main scientific principle/finding
   - SENTENCE 2: How the data/elements support this principle
   - SENTENCE 3: Scientific significance or practical importance
3. **Long Description**: Comprehensive description starting with "This image is a..."
4. **Transcribed Text**: All visible text in logical reading order

CRITICAL ACCESSIBILITY REQUIREMENTS:
- For Alt Text and Long Description: NEVER use unit abbreviations (e.g., use "milligrams per liter" not "mg/L", use "degrees Celsius" not "°C", use "percent" not "%")
- For Long Description: Always spell out all units completely for screen reader accessibility
- For Figure Description: Always spell out all units completely for screen reader accessibility  
- For Transcribed Text: Preserve exact text as shown (including abbreviations if present in original)
- Use "to" instead of hyphens for ranges (e.g., "5 to 10" not "5-10")

🚨 FIGURE DESCRIPTION WRITING RULES 🚨

MANDATORY: Write figure descriptions that explain MEANING, not appearance.

FORBIDDEN PHRASES (NEVER USE):
❌ "Figure 1. The diagram illustrates..." 
❌ "Figure 2. This image shows..."
❌ "The diagram shows..."
❌ "This figure illustrates..."
❌ "The image depicts..."

REQUIRED APPROACH - Follow this model:
✅ Begin with the main principle or finding the figure demonstrates
✅ Explain how the data or elements support that point  
✅ Conclude with scientific or practical significance

TRANSFORMATION EXAMPLE:
❌ BAD: "The diagram illustrates how ions move through a drift tube in an ion mobility spectrometer. Different ions separate based on size, mass, and charge due to the drift gas, allowing for identification."

✅ GOOD: "Ion mobility spectrometry separates ions according to how quickly they drift through a gas-filled tube under an electric field. Lighter or more compact ions move faster and reach the detector sooner than larger or more extended ones. This principle enables scientists to identify compounds based on their characteristic drift times."

WRITE LIKE A SCIENTIST: Describe what the science MEANS, not what is drawn.

EXAMPLES:
- Spectrum: Instead of: "Figure 1. The ion mobility spectrum shows peaks at drift times of 1.2, 1.5, and 3.8 milliseconds."
  WRITE: "Ion mobility spectrum showing multiple compounds with peaks at drift times of 1.2 ms, 1.5 ms, and 3.8 ms. By comparing these values to reference data, the peaks correspond to methanol, ethanol, and n-heptane respectively. The tallest peak at 1.5 ms indicates ethanol is the most abundant compound in the sample."

- Diagram: Instead of: "The diagram illustrates how ions move through a drift tube in an ion mobility spectrometer. Different ions separate based on size, mass, and charge due to the drift gas, allowing for identification."
  WRITE: "Ion mobility spectrometry separates ions according to how quickly they drift through a gas-filled tube under an electric field. Lighter or more compact ions move faster and reach the detector sooner than larger or more extended ones. This principle enables scientists to identify compounds based on their characteristic drift times."

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
              image_url: { url: finalImageData } 
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
      let altText = altMatch[1].trim();
      
      // Check if alt text exceeds 120 characters and retry if needed
      if (altText.length > 120) {
        console.log(`Alt text too long (${altText.length} chars), retrying for shorter version...`);
        
        try {
          const retryResponse = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `The previous alt text was too long (${altText.length} characters). Please create a shorter alt text (under 120 characters) for this image. Focus on the most essential elements only.

CRITICAL: Maximum 120 characters including spaces and punctuation.

Current alt text: "${altText}"

Generate a concise alt text under 120 characters:`
                  },
                  {
                    type: 'image_url',
                    image_url: { url: finalImageData }
                  }
                ]
              }
            ],
            max_tokens: 100,
            temperature: 0.3
          });
          
          const shorterAltText = retryResponse.choices[0].message.content.trim();
          
          // Clean up any formatting or quotes
          const cleanAltText = shorterAltText.replace(/^["']|["']$/g, '').trim();
          
          if (cleanAltText.length <= 120) {
            altText = cleanAltText;
            console.log(`✅ Retry successful: ${altText.length} characters`);
          } else {
            console.log(`⚠️ Retry still too long (${cleanAltText.length} chars), truncating...`);
            altText = cleanAltText.substring(0, 117) + '...';
          }
        } catch (retryError) {
          console.error('Alt text retry failed:', retryError);
          // Fallback: truncate original alt text
          altText = altText.substring(0, 117) + '...';
        }
      }
      
      sections.altText = altText;
      console.log(`Final alt text: ${altText.length} characters - "${altText}"`);
    }

    // Extract Figure Description  
    const figureMatch = result.match(/\*\*Figure Description.*?\*\*[:\s]*(.*?)(?=\n\*\*|\n\n|\n[0-9]\.|\n[a-zA-Z]|$)/s);
    if (figureMatch) {
      let figureDesc = figureMatch[1].trim();
      
      // ULTRA-COMPREHENSIVE figure numbering removal
      console.log('Original figureDesc:', figureDesc); // Debug log
      
      // Handle your exact case: "Figure 1. The diagram illustrates..."
      figureDesc = figureDesc.replace(/^Figure\s+1\.\s+The\s+diagram\s+illustrates/gi, 'The diagram illustrates');
      figureDesc = figureDesc.replace(/^Figure\s+\d+\.\s+The\s+diagram\s+illustrates/gi, 'The diagram illustrates');
      
      // Remove all "Figure X. " patterns with any spacing variations
      figureDesc = figureDesc.replace(/^Figure\s+\d+\.\s+/gi, '');
      figureDesc = figureDesc.replace(/^Figure\s*\d+\.\s*/gi, '');
      figureDesc = figureDesc.replace(/^Fig\.\s*\d+\.\s*/gi, '');
      figureDesc = figureDesc.replace(/^Fig\s+\d+\.\s*/gi, '');
      
      // Handle sentence starters specifically
      figureDesc = figureDesc.replace(/^Figure\s*\d*\.\s*The\s+/gi, 'The ');
      figureDesc = figureDesc.replace(/^Figure\s*\d*\.\s*This\s+/gi, 'This ');
      figureDesc = figureDesc.replace(/^Figure\s*\d*\.\s*An\s+/gi, 'An ');
      figureDesc = figureDesc.replace(/^Figure\s*\d*\.\s*Ion\s+/gi, 'Ion ');
      figureDesc = figureDesc.replace(/^Figure\s*\d*\.\s*Ions\s+/gi, 'Ions ');
      figureDesc = figureDesc.replace(/^Figure\s*\d*\.\s*A\s+/gi, 'A ');
      
      // Remove any remaining "Figure" at start
      figureDesc = figureDesc.replace(/^Figure\s*/gi, '');
      figureDesc = figureDesc.replace(/^Fig\.\s*/gi, '');
      figureDesc = figureDesc.replace(/^Fig\s*/gi, '');
      
      // Remove standalone numbers with punctuation
      figureDesc = figureDesc.replace(/^\d+[\.\:\-]\s*/g, '');
      
      console.log('Cleaned figureDesc:', figureDesc); // Debug log
      
      // FINAL NUCLEAR OPTION - Force removal of ANY remaining figure references
      // Handle exact case from user: "Figure 1. The ion drift tube diagram illustrates..."
      figureDesc = figureDesc.replace(/^Figure\s+\d+\.\s+The\s+ion\s+drift\s+tube\s+diagram\s+illustrates/gi, 'The ion drift tube diagram illustrates');
      figureDesc = figureDesc.replace(/^Figure\s+\d+\.\s+The\s+.*?\s+diagram\s+illustrates/gi, (match) => {
        return match.replace(/^Figure\s+\d+\.\s+/, '');
      });
      
      // Force removal - if it still starts with "Figure", remove everything until first real word
      if (/^Figure/i.test(figureDesc)) {
        figureDesc = figureDesc.replace(/^Figure[^a-zA-Z]*\d*[^a-zA-Z]*/, '');
      }
      
      // Clean up any remaining whitespace and ensure proper capitalization
      figureDesc = figureDesc.trim();
      if (figureDesc && figureDesc.length > 0) {
        figureDesc = figureDesc.charAt(0).toUpperCase() + figureDesc.slice(1);
      }
      sections.figureDescription = figureDesc;
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
        altText: sections.altText,
        figureDescription: sections.figureDescription,
        longDescription: sections.longDescription,
        transcribedText: sections.transcribedText,
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
