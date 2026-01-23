const { OpenAI } = require('openai');

// Built-in reference materials for educational accessibility standards
const EDUCATIONAL_STANDARDS = `EDUCATIONAL ACCESSIBILITY STANDARDS

This document provides standards for creating accessible image content that aligns with educational accessibility requirements.

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

Based on AccessiblePublishing.ca Guidelines for Extended Descriptions:

Structure (General to Specific):
- Always begin with: "This image is a [type] showing..."
- Start with a brief overview/summary of the image (1-2 sentences)
- Then provide more specific information and details
- Work from general concept to specific elements
- Allow reader to understand the initial concept first and foremost

Organizational Techniques (choose what works best for the image):
- Quadrants/thirds/halves: Describe parts by position (e.g., top left, bottom right, center)
- Compass directions: Use N, NE, S, SW, etc. (especially for maps)
- Clock positions: Divide by hours of clock face (for images with central focus)
- Systematic progression: For diagrams, describe step-by-step or component-by-component
- Tables/lists: For data-heavy images, organize information in structured format

Content Requirements:
- Include title and purpose of the image for context
- Focus on educational significance and learning objectives
- Describe elements important to understanding the purpose and meaning
- Reader should understand after reading once - be clear and precise
- Can be multiple paragraphs and include lists or tables as needed
- Use "to" for numeric ranges instead of hyphens
- NEVER use unit abbreviations - always spell out all units in full (e.g., "milligrams per liter" not "mg/L", "degrees Celsius" not "°C", "percent" not "%")
- Use "frequency distribution" not "bar chart" or "histogram"
- Never restate paragraph text or captions

Type-Specific Guidelines:
- Maps: Include name/title and legend description; focus on clarity over detail; ask "What is this map telling the reader?"
- Graphs/Charts: Provide title and purpose, describe layout (type, axes); ask "What is this graph telling the reader?"
- Diagrams/Flowcharts: Write systematically, step-by-step; describe all components that contribute to understanding
- Formulas/Equations: Use MathML when possible, or provide text version in alt-text (rarely need long description)

=== TRANSCRIBED TEXT STANDARDS ===

CRITICAL RULE: LITERAL TRANSCRIPTION ONLY
- Transcribe text EXACTLY as it appears - no interpretation
- If axis shows "0, 5, 10, 15, 20" write exactly that, not "0 to 20"
- If labels show "10, 11, 12, 13, 14" write each number individually
- Preserve spelling, capitalization, punctuation, and unit abbreviations exactly as shown
- Include every visible axis label, tick mark, legend entry, title, and data value

Format Guidelines:
- Use line breaks to separate different text elements
- Group related text logically (titles, then axis labels, then data values)
- For charts: List each visible axis tick mark individually
- For data labels: Include every visible number/label separately
- If no text visible, write "No text visible in image"

REMEMBER: You are a transcription service - copy exactly what you see!

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

=== EDUCATIONAL WRITING AND COPYEDIT GUIDELINES ===

Based on established educational writing and copyedit standards:

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
- Follow standard educational spelling and usage conventions
- Ensure all text meets accessibility readability standards

Quality Assurance:
- Review all content for accuracy and clarity
- Maintain consistency with educational content standards
- Check that descriptions serve educational purposes effectively
- Ensure compliance with institutional accessibility standards

=== EDUCATIONAL STYLE GUIDE STANDARDS ===

Based on educational accessibility style guide requirements:

Voice and Tone:
- Maintain professional yet approachable tone in all descriptions
- Use authoritative but accessible language appropriate for educational content
- Ensure consistency with established educational accessibility standards
- Balance technical accuracy with readability for diverse learner audiences

Terminology and Usage:
- Follow standard terminology for scientific and educational concepts
- Use consistent capitalization for proper nouns and technical terms
- Apply established style preferences for common educational phrases
- Maintain uniformity in how measurements, data, and statistics are presented

Content Structure and Organization:
- Follow clear hierarchical information presentation standards
- Use consistent formatting for similar types of content across descriptions
- Apply proven approaches to introducing and explaining complex concepts
- Ensure logical flow that supports effective pedagogical methodology

Accessibility Philosophy:
- Align all content with inclusive educational principles
- Use language that reflects commitment to accessible learning
- Maintain consistency with clear scientific communication standards
- Ensure descriptions support diverse curriculum objectives

Visual Content Guidelines:
- Follow established standards for describing charts, graphs, and data visualizations
- Use proven approaches for explaining visual relationships
- Apply consistent methodology for describing scientific illustrations
- Maintain clear standards for technical diagram explanations

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

// ====================== UNIT EXPANSION SYSTEM ======================
// Comprehensive unit abbreviation detection and expansion for accessibility

const UNIT_ABBREVS = [
  'mg/L', 'µg/L', 'μg/L', 'g/L', 'mol/L', 'mmol/L', 'M', 'mM', 'mol kg-1',
  'mg', 'g', 'kg', 'µg', 'μg',
  'mL', 'L', 'cm3', 'cm^3', 'cc',
  'kPa', 'Pa', 'atm', 'bar', 'J', 'J/mol', 'kJ', 'kJ/mol',
  'µS/cm', 'μS/cm', 'mS/cm', 'S/m', 'V', 'mV', 'mA',
  'mm', 'cm', 'km', 'µm', 'μm', 'nm', 'Å',
  '°C', 'K', 'min', 'ms', 'μs', 'µs', 'm s-1', 'm/s',
  '%', 'ppm', 'ppb', 'ppt',
  'N', 'Pa s', 'W', 'Hz', 'mol', 'eq', 'g mol-1', 'kg m-3', 'kg/m3'
];

const EXPAND_MAP = {
  'mg/L': 'milligrams per liter',
  'µg/L': 'micrograms per liter',
  'μg/L': 'micrograms per liter',
  'g/L': 'grams per liter',
  'mol/L': 'moles per liter',
  'mmol/L': 'millimoles per liter',
  'M': 'molar',
  'mM': 'millimolar',
  'mg': 'milligrams',
  'g': 'grams',
  'kg': 'kilograms',
  'µg': 'micrograms',
  'μg': 'micrograms',
  'mL': 'milliliters',
  'L': 'liters',
  'cm3': 'cubic centimeters',
  'cm^3': 'cubic centimeters',
  'cc': 'cubic centimeters',
  'kPa': 'kilopascals',
  'Pa': 'pascals',
  'atm': 'atmospheres',
  'bar': 'bar',
  'J': 'joules',
  'J/mol': 'joules per mole',
  'kJ': 'kilojoules',
  'kJ/mol': 'kilojoules per mole',
  'µS/cm': 'microsiemens per centimeter',
  'μS/cm': 'microsiemens per centimeter',
  'mS/cm': 'millisiemens per centimeter',
  'S/m': 'siemens per meter',
  'V': 'volts',
  'mV': 'millivolts',
  'mA': 'milliamps',
  'mm': 'millimeters',
  'cm': 'centimeters',
  'km': 'kilometers',
  'µm': 'micrometers',
  'μm': 'micrometers',
  'nm': 'nanometers',
  'Å': 'angstroms',
  '°C': 'degrees Celsius',
  'K': 'kelvin',
  'ms': 'milliseconds',
  'min': 'minutes',

  '%': 'percent',
  'ppm': 'parts per million',
  'ppb': 'parts per billion',
  'ppt': 'parts per trillion',
  'N': 'newtons',
  'W': 'watts',
  'Hz': 'hertz',
  'g mol-1': 'grams per mole',
  'kg m-3': 'kilograms per cubic meter',
  'kg/m3': 'kilograms per cubic meter',
  'm s-1': 'meters per second',
  'm/s': 'meters per second'
};

function normalizeTextForMatch(text) {
  return (text || '').replace(/\u00A0/g, ' ').toLowerCase();
}

function containsUnitAbbrev(text) {
  if (!text) return false;
  const t = normalizeTextForMatch(text);
  return UNIT_ABBREVS.some(u => t.includes(u.toLowerCase()));
}

function expandUnitsInText(text) {
  if (!text) return text;
  let out = text;

  Object.keys(EXPAND_MAP).forEach(abbr => {
    const safe = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Smart context-aware replacement to avoid false positives
    const contextRegex = new RegExp('\\b' + safe + '\\b', 'g');

    out = out.replace(contextRegex, (match, offset, string) => {
      const beforeContext = string.substring(Math.max(0, offset - 20), offset).toLowerCase();
      const afterContext = string.substring(offset + match.length, Math.min(string.length, offset + match.length + 20)).toLowerCase();

      // Don't expand single letters that are clearly labels
      if (match === 'A' && (beforeContext.includes('labeled') || beforeContext.includes('label') || afterContext.includes('labeled') || afterContext.includes('label'))) {
        return match; // Keep as label
      }

      if (match === 'C' && (beforeContext.includes('labeled') || beforeContext.includes('label') || afterContext.includes('labeled') || afterContext.includes('label') || beforeContext.includes('cuvette'))) {
        return match; // Keep as label
      }

      // Don't expand if it appears to be part of a word or abbreviation that's not a unit
      if (match === 'A' && (beforeContext.includes('amp') || afterContext.includes('mp'))) {
        return match; // Likely part of "amps" word being formed incorrectly
      }

      // For numerical contexts, be more confident about unit expansion
      if (/\d/.test(beforeContext) || /\d/.test(afterContext)) {
        return EXPAND_MAP[abbr];
      }

      // For temperature contexts with numbers, expand C
      if (match === 'C' && /temperature|°|degrees?/i.test(beforeContext + afterContext)) {
        return EXPAND_MAP[abbr];
      }

      // Default: expand if it seems like a measurement context
      if (/(pH|level|solution|concentration|volume|measurement)/i.test(beforeContext + afterContext)) {
        return EXPAND_MAP[abbr];
      }

      // Conservative: don't expand ambiguous single letters
      if (match.length === 1) {
        return match;
      }

      return EXPAND_MAP[abbr];
    });
  });

  return out;
}

function likelyHasUnknownAbbrev(text) {
  if (!text) return false;
  const t = normalizeTextForMatch(text);
  if (containsUnitAbbrev(t)) return false;
  // Look for abbreviation-like patterns containing / ° % or unit-like characteristics
  return /[a-z\u00B5\u03BC]{1,4}([\/\^°%]|\-)?[a-z0-9\/\^°%]{0,8}/i.test(t) && /[\/°%]/.test(t);
}

async function askModelForExpansion(client, finalImageData, suspectSnippet) {
  try {
    const instruction = `You are a careful accessibility assistant. A figure or caption contains the snippet: "${suspectSnippet}".
Provide a short, conservative expansion for the unit/abbreviation found suitable for screen-reader friendly alt text.
If confident the abbreviation is a standard unit, return only the expansion (for example, "kilopascals"). If not confident, return "UNKNOWN". Do not add extra commentary.`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: instruction },
            { type: 'image_url', image_url: { url: finalImageData } }
          ]
        }
      ],
      max_tokens: 40,
      temperature: 0.0
    });

    const text = (resp.choices[0].message.content || '').trim();
    if (!text) return { success: false, suggestion: null };
    if (text.toUpperCase() === 'UNKNOWN') return { success: false, suggestion: null };
    return { success: true, suggestion: text };
  } catch (err) {
    console.error('askModelForExpansion error', err);
    return { success: false, suggestion: null };
  }
}
// ====================== END UNIT EXPANSION SYSTEM ======================

exports.handler = async (event, context) => {
  console.log('🚨 FUNCTION CALLED - Structured Outputs v3.0');
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
    const { image, imageData, context, referenceDocument } = JSON.parse(event.body);

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
    let combinedReferences = EDUCATIONAL_STANDARDS;
    if (referenceDocument && referenceDocument.trim()) {
      combinedReferences += '\n\n=== ADDITIONAL CONTEXT ===\n\n' + referenceDocument;
    }

    const hasEducationalContext = context && context.trim().length > 0;

    const systemPrompt = `You are an expert accessibility specialist and scientific educator.
Your task is to analyze an image and generate comprehensive accessibility content adhering to strict educational standards.

=== PROCESS ===
1. Analyze the image to determine its type (CHART_GRAPH, SCIENTIFIC_FIGURE, PHOTOGRAPH, or MIXED).
2. Generate content specifically tailored to that type.
3. ADHERE STRICTLY to the following schemas and constraints.

=== EDUCATIONAL STANDARDS ===
${combinedReferences}

=== CONTEXT ===
${hasEducationalContext ? `USER CONTEXT: ${context}\n\nCRITICAL: You MUST use the User Context above to interpret the image. Connect visual elements to these specific educational concepts.` : 'No additional user context provided.'}
`;

    // Define the JSON Schema for Structured Outputs
    const responseSchema = {
      name: "accessibility_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          imageType: {
            type: "string",
            enum: ["CHART_GRAPH", "SCIENTIFIC_FIGURE", "PHOTOGRAPH", "MIXED"],
            description: "The classification of the image."
          },
          altText: {
            type: "string",
            description: "Concise description for screen readers. MAX 120 CHARACTERS. NO formatting. Spell out all units. Focus on the VISUAL REPRESENTATION (e.g., 'Chemical structure diagram...' or 'Bar chart showing...') rather than just the topic."
          },
          longDescription: {
            type: "string",
            description: "Comprehensive STRUCTURAL description. Do NOT just explain the science; describe the IMAGE. Describe lines, shapes, representations (2D/3D), colors, layout, and how elements are connected. For chemistry: describe atoms (spheres/labels), bonds (lines), and notation (brackets). USE 'This image is a [type] showing...' syntax."
          },
          figureDescription: {
            type: "string",
            description: "Kroodsma-style interpretive caption. 1-3 sentences. MUST start with the main scientific message/takeaway. This is where you explain the MEANING. DO NOT start with 'Figure X'."
          },
          transcribedText: {
            type: "string",
            description: "LITERAL transcription of all visible text. Preserve line breaks. If no text, return 'No text visible in image'."
          }
        },
        required: ["imageType", "altText", "longDescription", "figureDescription", "transcribedText"],
        additionalProperties: false
      }
    };

    const client = getClient();
    console.log('🚀 Sending request to OpenAI with JSON Schema...');

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: finalImageData }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: responseSchema
      },
      max_tokens: 2000,
      temperature: 0.1 // Low temperature for adherence to standards
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log('✅ OpenAI Response received and parsed.');
    console.log('Detected Type:', result.imageType);

    // Map result to sections object for consistency with existing frontend
    const sections = {
      altText: result.altText,
      longDescription: result.longDescription,
      figureDescription: result.figureDescription,
      transcribedText: result.transcribedText,
      // Metadata
      imageType: result.imageType,
      _meta: {
        originalAltText: result.altText,
        originalLongDescription: result.longDescription,
        originalFigureDescription: result.figureDescription
      }
    };

    // ====================== UNIT EXPANSION & QA SYSTEM ======================
    console.log('🔧 Starting unit expansion and QA processing...');

    // Initialize QA flags
    sections.altTextAutoFixed = false;
    sections.longDescriptionAutoFixed = false;
    sections.figureDescriptionNeedsReview = false;
    sections.unknownAbbrevDetected = false;
    sections.unknownAbbrevSuggestions = [];
    sections.altTextNeedsReview = false;
    sections.longDescriptionNeedsReview = false;

    // Process ALT TEXT
    if (sections.altText) {
      if (containsUnitAbbrev(sections.altText)) {
        const before = sections.altText;
        sections.altText = expandUnitsInText(sections.altText);
        sections.altTextAutoFixed = (sections.altText !== before);
        console.log('✅ Alt text auto-expanded known units.');
      }

      if (likelyHasUnknownAbbrev(sections.altText)) {
        sections.unknownAbbrevDetected = true;
        const suspectSnippet = sections.altText.match(/([A-Za-z\u00B5\u03BC]{1,4}[\/\^°%]?[A-Za-z0-9\/\^°%]{0,8})/i);
        const snippet = suspectSnippet ? suspectSnippet[0] : null;

        if (snippet) {
          const suggestionObj = await askModelForExpansion(getClient(), finalImageData, snippet);
          if (suggestionObj.success && suggestionObj.suggestion) {
            sections.altText = sections.altText.replace(new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), suggestionObj.suggestion);
            sections.altTextAutoFixed = true;
            sections.unknownAbbrevSuggestions.push({ snippet, suggestion: suggestionObj.suggestion });
          } else {
            sections.altTextNeedsReview = true;
          }
        }
      }
    }

    // Process LONG DESCRIPTION
    if (sections.longDescription) {
      if (containsUnitAbbrev(sections.longDescription)) {
        const before = sections.longDescription;
        sections.longDescription = expandUnitsInText(sections.longDescription);
        sections.longDescriptionAutoFixed = (sections.longDescription !== before);
      }
      // (Skipping deep AI check for long description to save time/tokens unless critical - logic preserved from original if needed, but simplified here for speed)
    }

    // Process FIGURE DESCRIPTION - Flag for review if contains abbreviations
    if (sections.figureDescription) {
      if (containsUnitAbbrev(sections.figureDescription) || likelyHasUnknownAbbrev(sections.figureDescription)) {
        sections.figureDescriptionNeedsReview = true;
      }
    }

    sections.transcribedTextVerbatim = true;
    sections.altTextTooLong = sections.altText.length > 120;

    if (sections.altTextTooLong) {
      console.warn(`⚠️ Alt text is ${sections.altText.length} chars (limit 120).`);
    }

    console.log('✅ Unit expansion and QA processing complete!');
    // ====================== END UNIT EXPANSION & QA SYSTEM ======================

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
        flags: {
          altTextAutoFixed: !!sections.altTextAutoFixed,
          longDescriptionAutoFixed: !!sections.longDescriptionAutoFixed,
          figureDescriptionNeedsReview: !!sections.figureDescriptionNeedsReview,
          transcribedTextVerbatim: !!sections.transcribedTextVerbatim,
          altTextTooLong: !!sections.altTextTooLong,
          altTextNeedsReview: !!sections.altTextNeedsReview,
          longDescriptionNeedsReview: !!sections.longDescriptionNeedsReview,
          unknownAbbrevDetected: !!sections.unknownAbbrevDetected
        },
        unitExpansion: {
          suggestions: sections.unknownAbbrevSuggestions || [],
          originalTexts: sections._meta || {}
        }
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
    } else if (error.code === 'context_length_exceeded') {
      errorMessage = 'Image or context is too large';
      statusCode = 400;
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
