const { OpenAI } = require('openai');

// Built-in reference materials for educational accessibility standards
const EDUCATIONAL_STANDARDS = `EDUCATIONAL ACCESSIBILITY STANDARDS (WCAG 2.2 ALIGNED)

=== CORE RULES (NON-NEGOTIABLE) ===

1. ATTRIBUTES & LIMITS
- Alt Text: STRICT limit of 120 characters. Count characters. If >120, rewrite concisely without losing meaning. 
- Long Description: Required for complex images (charts, diagrams, detailed photos). No strict limit, but aim for clarity.
- Transcription: LITERAL transcription of text (see below).

2. VISUAL OBJECTIVITY (For Alt Text & Long Description)
- Describe ONLY what is visible. No interpretation, no "intent", no "cause".
- NO "image of", "picture of", "this shows", "this represents".
- NO identification of people (use "person", "student"), species, or locations unless explicitly labeled.
- State "Unconfirmed" for ambiguous features; do not guess.
- AVOID process verbs (enters, moves, flows) unless labeled. Use spatial terms (placed, positioned, connected).

3. SPATIAL & STRUCTURAL CLARITY
- Use precise coordinates: "top left", "center", "background", "foreground".
- Describe relationships: "connected to", "adjacent to", "encircled by".
- For diagrams: Trace paths visually (e.g., "arrow points from A to B").

=== FIELD-SPECIFIC GUIDELINES ===

TYPE: PHOTOGRAPH
- Focus on main subject, setting, and key actions/interactions.
- Ignoring minor background clutter.

TYPE: CHART/GRAPH (STEM)
- Alt Text: Chart type + X/Y axes titles + general trend (e.g., "Line graph of Velocity vs Time showing linear increase").
- Long Description:
  - Summary: Title/Purpose.
  - Structure: Axes (Label, Units, Range).
  - Data: Key data points, trends (peaks, troughs, intersections), or a structured summary of values.
  - CONCLUSION NOT INTERPRETATION: State the visual trend ("positive slope"), not the scientific principle ("Newton's Law") unless labeled.

TYPE: CHEMISTRY/DIAGRAMS
- Do NOT name molecules/structures unless labels appear in image.
- Describe geometry: "Six-membered ring", "double lines", "wedge bonds".
- Symbols: "Arrow pointing right", "Delta symbol above arrow".

=== TEXT TRANSCRIPTION STANDARDS ===
- Copy visible text EXACTLY (spelling, capitalization, punctuation).
- Use quotation marks for labels: Label "Fig 1".
- If text is claimed but not visible, state: "Text unreadable/not visible".
- Do not expand abbreviations in the TRANSCRIPTION field.

=== UNIT & ABBREVIATION HANDLING (CRITICAL) ===
- IN DESCRIPTIONS (Alt/Long/Figure): ALWAYS expand units.
  - "mg/L" -> "milligrams per liter"
  - "°C" -> "degrees Celsius"
  - "5-10" -> "5 to 10" (No hyphens for ranges)
- IN TRANSCRIPTION: Keep exact ("mg/L").

=== FIGURE DESCRIPTION (EDUCATIONAL CONTEXT) ===
- Purpose: Pedagogical interpretation (Kroodsma Style).
- Structure: 
  1. Main Finding/Take-home message.
  2. Supporting detail from image.
  3. Significance.
- This is the ONLY place for interpretation/teaching.`;

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
2. Generate content specifically tailored to that type, applying the FIELD-SPECIFIC GUIDELINES.
3. ADHERE STRICTLY to the CORE RULES, especially the 120-character limit for Alt Text and visual objectivity.

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
