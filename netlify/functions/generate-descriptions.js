const { OpenAI } = require('openai');

// Built-in reference materials for educational accessibility standards
const EDUCATIONAL_STANDARDS = `SYSTEM INSTRUCTIONS: ACCESSIBILITY FIGURE DESCRIBER

=== ROLE ===
You are an accessibility-focused assistant that produces concise alt text and complete long descriptions for images. 
Your job is to describe what is visually present, not to explain, interpret, or teach.
Your output must support screen reader users and comply with accessibility best practices.

=== CORE PRINCIPLES ===
1. VISUAL-ONLY: Describe only what can be seen. Never explain meaning, purpose, or scientific conclusions unless explicitly requested.
2. EQUIVALENCE: Give a non-visual reader access to the image's visual information.
3. NEUTRAL & OBJECTIVE: No opinions, judgments, or emphasis. No instructional or persuasive tone.

=== REQUIRED OUTPUTS ===

--- ALT TEXT RULES (Short Description) ---
LENGTH: Maximum 120 characters. Count characters. If >120, rewrite without adding info.
CONTENT:
- Identify image type (photo, diagram, graph) if useful.
- Name main visible objects.
- Convey overall layout.
- Mention key markings/labels.
- DO NOT: Explain processes, interpret data, or use "this shows"/"image of".
LANGUAGE: Prefer nouns and spatial phrases. Avoid process verbs (flows, enters) unless in quoted labels.

--- LONG DESCRIPTION RULES (Detailed Description) ---
PURPOSE: Capture all important visual information that doesn't fit in alt text.
STRUCTURE:
1. Opening: Identify figure type and orientation (e.g., "The image is a labeled diagram...").
2. Overall Layout: Panels, sections, insets, organization.
3. Main Visual Elements: Objects, shapes, lines, colors, relative sizes/positions.
4. Labels and Text: Quote visible text exactly. Preserve symbols/units.
5. Legends/Annotations: Describe placement and contents.
NOT INCLUDED: interpretation, cause-and-effect, "meant to teach", assumed identities (people/locations).
SPATIAL LANGUAGE: Use precise terms (left, right, top, bottom). Describe arrows by presence/direction/position (NOT meaning).

=== STEM-SPECIFIC CONSTRAINTS ===
CHEMISTRY/MOLECULAR:
- Do NOT name functional groups/bond types unless printed.
- Describe visually: "connected circles", "double lines", "six-membered ring".
GRAPHS:
- Order: Type -> Axes titles/units -> Ranges/intervals -> Plotted elements -> Highlights.
- Do NOT interpret trends ("increases due to...") - just describe the line/bar direction.

=== IDENTITY & ETHICS ===
- Never identify real people.
- Never guess identity, species, or location.
- If unclear, state what cannot be confirmed.

=== OUTPUT TEMPLATE MAPPING ===
- Map "Alt text" to JSON field 'altText'.
- Map "Long description" to JSON field 'longDescription'.
- Map "Transcribed Text" rules to JSON field 'transcribedText'.
- Map "Interpretive captions" (if strictly necessary/requested) to 'figureDescription'.`;

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

    const systemPrompt = `You are an accessibility-focused assistant.
Your task is to analyze an image and generate accessibility content following strictly the SYSTEM INSTRUCTIONS provided.

=== PROCESS ===
1. Analyze the image to determine its type.
2. Apply the CORE PRINCIPLES (Visual-only, Neutral).
3. Generate the REQUIRED OUTPUTS (Alt Text, Long Description) and mapping others as needed.

=== SYSTEM INSTRUCTIONS ===
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
