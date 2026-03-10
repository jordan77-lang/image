// Netlify Function: Generate Learning Objectives
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load reference standards document
const STANDARDS_PATH = path.join(__dirname, '..', '..', 'learning-objectives-standards.txt');
let STANDARDS_CONTENT = '';

// Load NGSS HS performance expectations
const NGSS_PATH = path.join(__dirname, '..', '..', 'data', 'ngss-pe-hs.json');
let NGSS_PE = [];

try {
  STANDARDS_CONTENT = fs.readFileSync(STANDARDS_PATH, 'utf-8');
} catch (error) {
  console.warn('Warning: learning-objectives-standards.txt not found. Using default guidelines.');
  STANDARDS_CONTENT = 'Use Bloom\'s Taxonomy verbs and create measurable, student-centered objectives.';
}

try {
  NGSS_PE = JSON.parse(fs.readFileSync(NGSS_PATH, 'utf-8'));
} catch (error) {
  console.warn('Warning: ngss-pe-hs.json not found or unreadable. NGSS auto-alignment will be skipped.');
  NGSS_PE = [];
}

// Science subject keywords — NGSS alignment only applies to these
const SCIENCE_KEYWORDS = [
  'biology', 'chemistry', 'physics', 'science', 'ecology', 'genetics', 'anatomy',
  'physiology', 'earth science', 'environmental', 'forensic', 'biochemistry',
  'microbiology', 'geology', 'astronomy', 'neuroscience', 'lab', 'laboratory'
];

const isScience = (subject_area, content_text) => {
  const haystack = ((subject_area || '') + ' ' + (content_text || '').substring(0, 500)).toLowerCase();
  return SCIENCE_KEYWORDS.some(kw => haystack.includes(kw));
};

// Simple tokenization and cosine similarity for NGSS matching
const tokenize = (text) => (text || '')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const toVector = (tokens) => {
  const vec = Object.create(null);
  tokens.forEach(t => { vec[t] = (vec[t] || 0) + 1; });
  return vec;
};

const cosine = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const k in a) {
    const av = a[k];
    normA += av * av;
    if (b[k]) dot += av * b[k];
  }
  for (const k in b) {
    const bv = b[k];
    normB += bv * bv;
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Raised threshold from 0.08 → 0.15 to reduce spurious matches
const getTopNgssMatches = (text, topN = 2, minScore = 0.15) => {
  if (!NGSS_PE.length || !text) return [];
  const vec = toVector(tokenize(text));
  const scored = NGSS_PE.map(pe => {
    const peVec = toVector(tokenize(pe.summary + ' ' + pe.code));
    return { ...pe, score: cosine(vec, peVec) };
  }).filter(item => item.score >= minScore);

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ code, summary, score }) => ({ code, summary, score }));
};

// Vague verb check — reject objectives containing these
const VAGUE_VERBS = /\b(understand|know|learn|appreciate|be familiar with|be aware of|grasp|comprehend)\b/i;
const WRONG_PREFIX = /^(students will( be able to)?|learners will( be able to)?|you will be able to)/i;

const validateObjectives = (objectives) => {
  const issues = [];
  objectives.forEach((lo, i) => {
    const text = lo.objective_text || '';
    if (WRONG_PREFIX.test(text.trim())) {
      issues.push(`LO${i + 1} starts with forbidden prefix: "${text.substring(0, 40)}"`);
    }
    if (VAGUE_VERBS.test(text)) {
      issues.push(`LO${i + 1} contains vague verb: "${text.substring(0, 60)}"`);
    }
  });
  return issues;
};

// Strict JSON schema for structured outputs
// Note: strict mode requires anyOf for nullable fields — type arrays are not supported
const LO_JSON_SCHEMA = {
  type: 'json_schema',
  json_schema: {
    name: 'learning_objectives_response',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        learning_objectives: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              objective_text: { type: 'string' },
              bloom_level: { type: 'string' },
              phase: { anyOf: [{ type: 'string' }, { type: 'null' }] },
              alignment: { anyOf: [{ type: 'string' }, { type: 'null' }] }
            },
            required: ['id', 'objective_text', 'bloom_level', 'phase', 'alignment'],
            additionalProperties: false
          }
        },
        metadata: {
          type: 'object',
          properties: {
            audience_level: { type: 'string' },
            subject_area: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            framework: { type: 'string' },
            objective_scope: { type: 'string' },
            source_file_ids: { type: 'array', items: { type: 'string' } },
            generated_at: { type: 'string' }
          },
          required: ['audience_level', 'subject_area', 'framework', 'objective_scope', 'source_file_ids', 'generated_at'],
          additionalProperties: false
        }
      },
      required: ['learning_objectives', 'metadata'],
      additionalProperties: false
    }
  }
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const {
      content_text,
      audience_level = 'college_intro',
      subject_area = null,
      objective_scope = 'course_level',
      framework = 'all',
      num_objectives = 'auto'
    } = JSON.parse(event.body);

    // Validate required fields
    if (!content_text || content_text.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'content_text is required' })
      };
    }

    // Warn if content was truncated on client — flag in response
    const CONTENT_LIMIT = 8000;
    const contentTruncated = content_text.length > CONTENT_LIMIT;
    const contentForPrompt = content_text.substring(0, CONTENT_LIMIT);

    // Determine if this is a DSL lab mode request
    const isDSLLab = objective_scope === 'dsl_lab';

    // Auto-detect number of objectives
    const contentLower = content_text.toLowerCase();
    const countAssessedItems = () => {
      let counts = [];

      // Question marks (rough proxy for discrete questions)
      const qm = (content_text.match(/\?/g) || []).length;
      if (qm) counts.push(qm);

      // Common question stems
      const questionStems = [
        /\bwhich of the following\b/gi,
        /\bselect (the|all) (best|correct)\b/gi,
        /\bchoose (the|all) (best|correct)\b/gi,
        /\btrue\/?false\b/gi,
        /\bmultiple choice\b/gi,
        /\bshort answer\b/gi,
        /\bfree[- ]response\b/gi,
        /\bproblem \d+\b/gi,
        /\bquestion \d+\b/gi
      ];
      questionStems.forEach(rx => {
        const m = contentLower.match(rx);
        if (m) counts.push(m.length);
      });

      // Enumerated steps
      const stepMatches = content_text.match(/^\s*\d+[\.\)]\s+/gim);
      if (stepMatches) counts.push(stepMatches.length);

      // Imperative task verbs at line starts
      const imperative = content_text.match(/^(\s*(calculate|determine|identify|explain|compare|predict|analyze|evaluate|justify|classify|design|derive|prove|show|compute|solve)\b)/gim);
      if (imperative) counts.push(imperative.length);

      // Activity/objective indicators
      const activityIndicators = [
        /objective \d+[:\.]/gi,
        /step \d+[:\.]/gi,
        /assessment \d+/gi,
        /assignment \d+/gi,
        /task \d+/gi,
        /exercise \d+/gi,
        /outcome \d+/gi,
        /students will be able to/gi
      ];
      activityIndicators.forEach(pattern => {
        const matches = contentLower.match(pattern);
        if (matches) counts.push(matches.length);
      });

      const detected = counts.length ? Math.max(...counts) : 0;
      return detected;
    };

    const assessedItemCount = countAssessedItems();
    const MAX_OBJECTIVES = 12;
    let targetNumObjectives;
    if (num_objectives === 'auto') {
      if (isDSLLab) {
        // DSL lab mode: detect prelab/lab/postlab phases (1 objective each by default)
        targetNumObjectives = Math.min(Math.max(assessedItemCount, 3), MAX_OBJECTIVES);
      } else if (assessedItemCount > 0) {
        targetNumObjectives = Math.min(Math.max(assessedItemCount, 4), MAX_OBJECTIVES);
      } else {
        targetNumObjectives = 5;
      }
    } else {
      const requested = parseInt(num_objectives) || 5;
      targetNumObjectives = Math.min(Math.max(requested, 1), MAX_OBJECTIVES);
    }
    console.log(`Detected ~${assessedItemCount} assessed items; generating ${targetNumObjectives} objectives (scope: ${objective_scope})`);

    // Determine if NGSS alignment is relevant for this content
    const scienceContent = isScience(subject_area, content_text);
    const useNGSS = scienceContent && (framework === 'all' || framework === 'ngss');

    // ─── SYSTEM PROMPT ────────────────────────────────────────────────────────
    const systemPrompt = `You are an expert curriculum-authoring assistant specializing in learning objectives design for Dreamscape Learn (DSL), an immersive educational platform used at universities and K-12 institutions.

KEY PRINCIPLES:
- Write DIRECT, CONCISE objectives without "Students will" or "Learners will" phrasing — NEVER use these prefixes
- Start with a strong action verb or "Given X, [action verb]..." format
- Use precise, measurable action verbs from Bloom's Taxonomy
- Each objective must be specific, observable, and assessable at a GRANULAR skill level
- Avoid vague verbs: understand, know, learn, appreciate, be familiar with — use concrete verbs like identify, analyze, calculate, design, evaluate, determine, predict, classify
- Keep objectives concise and focused on ONE discrete skill or task

BLOOM'S TAXONOMY VERBS BY LEVEL:
- Remember (Level 1): define, list, identify, recall, recognize, state
- Understand (Level 2): explain, describe, summarize, classify, compare, interpret
- Apply (Level 3): use, solve, demonstrate, calculate, apply, predict, show, determine
- Analyze (Level 4): analyze, differentiate, distinguish, examine, investigate, categorize
- Evaluate (Level 5): evaluate, assess, critique, judge, justify, defend, argue
- Create (Level 6): create, design, construct, develop, formulate, compose, plan

DREAMSCAPE LEARN PREFERRED STYLE:
For math and non-lab content, use "Given X, [verb] Y" format:
✅ "Given a graph of a linear function, find the horizontal or vertical intercept."
✅ "Given symbolic notation for an equation, express the meaning in words."
✅ "Given two points of a linear function, determine the slope and intercept."
✅ "Given a frequency distribution, estimate the proportion of data above a threshold."
✅ "Given an element's symbol, use a periodic table to determine its atomic number."

For DSL science lab activities, frame objectives as investigative questions:
✅ "Objective 1 (Prelab): What types of compounds are present, and how can we separate them?"
✅ "Objective 2 (Lab): What can chemical evidence from the sample tell us about its origin?"
✅ "Objective 3 (Postlab): What clues hidden in the data can help trace it to a source?"

FORBIDDEN:
❌ "Students will be able to identify elements..."
❌ "Learners will determine..."
❌ "Understand the properties of elements"
❌ "Learn about periodic trends"
❌ "Analyze and interpret data to draw conclusions" (too broad, multiple skills)

BLOOM'S LEVEL FIELD:
For the bloom_level field, return one of exactly these strings:
"Remember (Level 1)", "Understand (Level 2)", "Apply (Level 3)", "Analyze (Level 4)", "Evaluate (Level 5)", "Create (Level 6)"

PHASE FIELD:
- For DSL lab mode: set phase to "Prelab", "Lab", or "Postlab"
- For all other modes: set phase to null

ALIGNMENT FIELD (max 220 characters):
- Include Bloom's taxonomy level + up to 2 relevant standards codes with concise titles
- Separate with " · "
- Example: "Bloom's: Apply (Level 3) · NGSS HS-PS1-1: Use periodic table as a model · CCSS.MATH.CONTENT.HSN.Q.A.1: Use units to guide problems"
- If nothing fits, set to null
- Do NOT use ellipses or truncate — keep concise but complete

OUTPUT: Return valid JSON matching the schema exactly. No commentary, no markdown blocks.`;

    // ─── SCOPE GUIDANCE ───────────────────────────────────────────────────────
    let scopeGuidance = '';
    if (isDSLLab) {
      scopeGuidance = `DSL LAB MODE — INVESTIGATIVE QUESTION FORMAT:
Generate objectives as investigative questions grouped by lab phase (Prelab, Lab, Postlab).
- Prelab objectives: conceptual foundation, prior knowledge, preparation tasks
- Lab objectives: hands-on procedures, data collection, measurements
- Postlab objectives: analysis, interpretation, conclusions, synthesis

Each objective should be a question that frames what the student is investigating:
✅ "What types of compounds are in the boot print, and how can we separate them?"
✅ "What can chemical evidence from the sample tell us about its origin?"
✅ "What isotopic clues in the hair sample reveal the suspect's location?"

Set the phase field to "Prelab", "Lab", or "Postlab" for each objective.
Distribute objectives proportionally: roughly 1/3 Prelab, 1/3 Lab, 1/3 Postlab unless content suggests otherwise.`;
    } else if (objective_scope === 'course_level') {
      scopeGuidance = `COURSE-LEVEL (GENERALIZED) MODE:
Create objectives broad enough to apply across any assignment in the course. Strip all specific examples, names, substances, and proper nouns. Use generic, discipline-level terminology.
- Replace specific substances → generic categories: "arsenic" → "an element"; "silver halide" → "a metal compound"
- Use "Given X" to show transferability: "Given an element's symbol, use a periodic table to determine its atomic number."
- Focus on core skills that transfer to ANY content in the discipline
- Make objectives reusable for 10+ different assignments/activities

Set phase to null for all course-level objectives.`;
    } else {
      scopeGuidance = `TASK-SPECIFIC MODE:
Create objectives that directly match the exact content, examples, and activities in this material.
- Use specific names, materials, and examples from the content
- Reference the actual tasks students will perform
- Include specific concepts and terminology mentioned
- Tie objectives directly to this particular assignment/activity

Set phase to null for all task-specific objectives.`;
    }

    // ─── ALIGNMENT GUIDANCE ───────────────────────────────────────────────────
    let alignmentGuidance = '';
    if (framework === 'all') {
      alignmentGuidance = `STANDARDS ALIGNMENT (keep under 220 characters total):
1. BLOOM'S (required): "Bloom's: [Verb] (Level [1-6])"
2. ${useNGSS ? 'NGSS: up to 2 codes with concise titles (science content only)' : 'NGSS: not applicable for this subject — omit'}
3. CCSS: up to 2 codes with concise titles when applicable (ELA/Math/cross-disciplinary)
   - CCSS.ELA-LITERACY.RST for reading science/technical texts
   - CCSS.MATH for quantitative reasoning
Separate with " · ". If alignment exceeds 220 chars, keep Bloom's + best single standard only.`;
    } else if (framework === 'ngss') {
      alignmentGuidance = useNGSS
        ? 'Align to NGSS performance expectations. Include code + concise title. Max 220 characters.'
        : 'NGSS not applicable for this subject area. Set alignment to null or use Bloom\'s only.';
    } else if (framework === 'ccss') {
      alignmentGuidance = 'Align to Common Core State Standards. Include code + concise title. Max 220 characters.';
    } else {
      alignmentGuidance = 'Align to Bloom\'s Taxonomy levels. Include level name and number. Max 220 characters.';
    }

    // ─── USER PROMPT ──────────────────────────────────────────────────────────
    const userPrompt = `TASK: Extract exactly ${targetNumObjectives} discrete learning objectives from the content below.

CONTEXT:
- Audience level: ${audience_level}
${subject_area ? `- Subject area: ${subject_area}` : '- Subject area: not specified'}
- Objective scope: ${isDSLLab ? 'DSL Lab (investigative question format, phase-grouped)' : objective_scope === 'course_level' ? 'Course-level (generalized)' : 'Task-specific (exact details)'}
- Framework: ${framework === 'all' ? "All standards (Bloom's + ${useNGSS ? 'NGSS + ' : ''}CCSS)" : framework}
${contentTruncated ? '- NOTE: Content was truncated to 8000 characters. Prioritize the most prominent tasks.' : ''}

${scopeGuidance}

CONTENT TO ANALYZE:
"""
${contentForPrompt}
"""

INSTRUCTIONS:
1. Scan for explicitly stated objectives or learning outcomes first:
   - Sections labeled "objectives," "learning goals," "outcomes," "students will," "you will complete"
   - Numbered lists describing what students will do
   - If found, EXTRACT and REFORMAT them to match DSL style

2. If no explicit objectives exist, reverse-engineer from student tasks:
   - Questions students must answer
   - Calculations students must perform
   - Procedures students must follow
   - Analyses or judgments students must make
   - Data interpretation tasks

3. ${alignmentGuidance}

4. Order objectives by instructional sequence (foundational first, higher-order last).

5. STYLE — match these exactly:
   ✅ "Given a graph of a linear function, find the slope."
   ✅ "Given two points of a linear function, determine the slope and intercept."
   ✅ "Classify an element as metal, metalloid, or nonmetal based on its position in the periodic table."
   ✅ "Predict an element's tendency to lose or gain electrons based on its position in the periodic table."
   ✅ "Given evidence and a claim, determine whether the evidence supports the claim."

6. bloom_level field: use EXACTLY one of these strings:
   "Remember (Level 1)", "Understand (Level 2)", "Apply (Level 3)", "Analyze (Level 4)", "Evaluate (Level 5)", "Create (Level 6)"

7. phase field: ${isDSLLab ? '"Prelab", "Lab", or "Postlab" — distribute proportionally' : 'null for all objectives'}

8. Generate EXACTLY ${targetNumObjectives} objectives. Cluster similar skills into one objective rather than repeating.

OUTPUT: Return the JSON object with EXACTLY ${targetNumObjectives} learning objectives.`;

    // ─── API CALL ─────────────────────────────────────────────────────────────
    console.log('Calling OpenAI API for learning objectives generation...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 3200,
      response_format: LO_JSON_SCHEMA
    });

    // Check for refusal (gpt-5.4 structured output refusal pattern)
    const choice = completion.choices[0];
    if (choice.finish_reason === 'refusal' || choice.message.refusal) {
      throw new Error('AI declined to generate objectives for this content.');
    }

    const responseText = choice.message.content;
    console.log('OpenAI response received');

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate response structure
    if (!result.learning_objectives || !Array.isArray(result.learning_objectives)) {
      throw new Error('Invalid response structure: missing learning_objectives array');
    }

    // Server-side validation: flag any vague/wrong-prefix objectives
    const validationIssues = validateObjectives(result.learning_objectives);
    if (validationIssues.length > 0) {
      console.warn('Objective validation warnings:', validationIssues);
      // Attach warnings to response but do not block — let frontend show them
      result._validation_warnings = validationIssues;
    }

    // Auto-append NGSS alignments — only for science content
    if (useNGSS) {
      result.learning_objectives = result.learning_objectives.map((lo) => {
        const matches = getTopNgssMatches(lo.objective_text, 2, 0.15);
        if (matches.length) {
          const ngssString = matches.map(m => `${m.code}: ${m.summary}`).join(' · ');
          const existing = lo.alignment ? lo.alignment.trim() : '';
          // Only append if total stays under 220 chars
          const combined = existing ? `${existing} · ${ngssString}` : ngssString;
          lo.alignment = combined.length <= 220 ? combined : existing || ngssString.substring(0, 220);
        }
        return lo;
      });
    }

    // Fill in metadata
    result.metadata = {
      audience_level,
      subject_area,
      objective_scope,
      framework,
      source_file_ids: [],
      generated_at: new Date().toISOString(),
      content_truncated: contentTruncated
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error in generate-learning-objectives function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate learning objectives',
        message: error.message
      })
    };
  }
};
