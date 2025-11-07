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

try {
  STANDARDS_CONTENT = fs.readFileSync(STANDARDS_PATH, 'utf-8');
} catch (error) {
  console.warn('Warning: learning-objectives-standards.txt not found. Using default guidelines.');
  STANDARDS_CONTENT = 'Use Bloom\'s Taxonomy verbs and create measurable, student-centered objectives.';
}

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
        
    // Auto-detect number of objectives and ENFORCE >= number of assessed items
    const contentLower = content_text.toLowerCase();
    const countAssessedItems = () => {
      let counts = [];
      // 1) Question marks (rough proxy for discrete questions)
      const qm = (content_text.match(/\?/g) || []).length;
      if (qm) counts.push(qm);

      // 2) Common question stems
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

      // 3) Enumerated steps that likely indicate assessed tasks
      const stepMatches = content_text.match(/^\s*\d+[\.\)]\s+/gim);
      if (stepMatches) counts.push(stepMatches.length);

      // 4) Imperative task verbs at line starts (Calculate, Determine, Identify, Explain, Compare, Predict, Analyze, Evaluate, Justify, Classify)
      const imperative = content_text.match(/^(\s*(calculate|determine|identify|explain|compare|predict|analyze|evaluate|justify|classify|design|derive|prove|show|compute|solve)\b)/gim);
      if (imperative) counts.push(imperative.length);

      // 5) Existing activity/objective indicators
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

      // Use the maximum heuristic count as a conservative lower bound of assessed items
      const detected = counts.length ? Math.max(...counts) : 0;
      return detected;
    };

    const assessedItemCount = countAssessedItems();
    let targetNumObjectives;
    if (num_objectives === 'auto') {
      targetNumObjectives = assessedItemCount > 0 ? Math.min(assessedItemCount, 30) : 5;
    } else {
      const requested = parseInt(num_objectives) || 5;
      // Enforce minimum equal to assessed items
      targetNumObjectives = Math.max(requested, Math.min(assessedItemCount || 0, 30));
    }
    console.log(`Detected ~${assessedItemCount} assessed items; generating ${targetNumObjectives} objectives`);

    // Build system prompt with DSL standards
  const systemPrompt = `You are an expert curriculum-authoring assistant specializing in learning objectives design.

KEY PRINCIPLES:
- Write DIRECT, CONCISE objectives without "Students will" or "Learners will" phrasing
- Start with a strong action verb or "Given X, [action verb]..." format
- Use precise, measurable action verbs from Bloom's Taxonomy or domain-specific frameworks
- Each objective must be specific, observable, and assessable at a GRANULAR skill level
- Avoid vague verbs like "understand," "know," "learn," "appreciate" — use concrete verbs like identify, analyze, calculate, design, evaluate, determine, predict, classify
- Keep objectives concise and focused on ONE discrete skill or task
- Objectives must be achievable within the scope described in the source content

BLOOM'S TAXONOMY VERBS BY LEVEL:
- Remember: define, list, identify, recall, recognize, state
- Understand: explain, describe, summarize, paraphrase, classify, compare
- Apply: use, solve, demonstrate, calculate, apply, predict, show, determine
- Analyze: analyze, differentiate, distinguish, examine, investigate, categorize
- Evaluate: evaluate, assess, critique, judge, justify, defend, argue
- Create: create, design, construct, develop, formulate, compose, plan

FORMAT REQUIREMENTS (CRITICAL):
- NEVER start with "Students will" or "Learners will" — start directly with action verb or "Given X, [action verb]"
- Use "Given X, [action verb]..." when objectives depend on provided information or context
- Use sentence case (capitalize first word only, unless proper nouns)
- No contractions, no em dashes
- One objective = one discrete, testable skill
- Maximum length: 120 characters preferred

STYLE EXAMPLES (match these exactly):
✅ "Given a frequency distribution (e.g., histogram), estimate the proportion of data above a certain threshold."
✅ "Predict the type of quantitative evidence needed to justify a claim about the expected value of a variable."
✅ "Given evidence and a claim, determine whether the evidence supports the claim."
✅ "Identify an element on the periodic table using its atomic number or number of protons."
✅ "Given an element's symbol, use a periodic table to determine its atomic number."
✅ "Determine the group number of an element based on its name, symbol, or atomic number."
✅ "Classify an element as a metal, metalloid, or nonmetal based on its position within the periodic table."
✅ "Predict an element's tendency to lose or gain electrons based on its position within the periodic table."
✅ "Determine the number of valence electrons of an element based on its position within the periodic table."

WRONG STYLE (do not write like this):
❌ "Students will be able to identify elements on the periodic table"
❌ "Understand the properties of elements"
❌ "Learn about periodic trends"
❌ "Analyze and interpret data to draw conclusions" (too broad, multiple skills)

OUTPUT SCHEMA:
Return valid JSON matching this exact structure:
{
  "learning_objectives": [
    {
      "id": "LO1",
      "objective_text": "<concise, measurable objective starting with action verb>",
      "alignment": "<one or more standards; if multiple, separate with ' · '; include Bloom's level and any applicable NGSS/CCSS codes; or null if none>"
    }
  ],
  "metadata": {
    "audience_level": "<value>",
    "subject_area": "<value or null>",
    "framework": "<value>",
    "source_file_ids": [],
    "generated_at": "<ISO8601 timestamp>"
  }
}

CRITICAL: Return ONLY valid JSON. No commentary before or after. No markdown code blocks.`;

    // Build scope-specific guidance
    const scopeGuidance = objective_scope === 'course_level'
      ? `GENERALIZATION REQUIREMENT:
Create COURSE-LEVEL objectives that are UNIVERSALLY APPLICABLE across any assignment in the course, not tied to specific content or examples.
- Strip ALL specific examples, names, substances, locations, events, dates, and proper nouns
- Use ONLY generic, discipline-level terminology (e.g., "elements" not "arsenic"; "data sets" not "arsenic concentrations")
- Frame objectives with "Given X" to show transferability (e.g., "Given an element's symbol, use a periodic table to...")
- Focus on core skills, methods, and reasoning that transfer to ANY content in the discipline
- Make objectives reusable for 10+ different assignments/activities in the same course

CRITICAL GENERALIZATION RULES:
1. Replace specific substances/materials → generic categories:
   ❌ "arsenic" → ✅ "an element" or "a substance"
   ❌ "silver halide and barium ferrite" → ✅ "metal compounds"
   ❌ "archival film samples" → ✅ "solid samples" or "materials"

2. Replace specific examples → universal patterns:
   ❌ "Calculate the concentration of arsenic in water samples" → ✅ "Calculate the concentration of a substance in a solution"
   ❌ "Identify arsenic using the periodic table" → ✅ "Identify an element on the periodic table using its atomic number"
   ❌ "Analyze arsenic structure to predict reactivity" → ✅ "Analyze the structure of an element to predict its chemical reactivity"

3. Use "Given X" format for transferability:
   ✅ "Given a frequency distribution (e.g., histogram), estimate the proportion of data above a certain threshold"
   ✅ "Given an element's symbol, use a periodic table to determine its atomic number"
   ✅ "Given evidence and a claim, determine whether the evidence supports the claim"

4. Focus on METHODS and SKILLS, not specific content:
   ✅ "Predict the type of quantitative evidence needed to justify a claim about the expected value of a variable"
   ✅ "Interpret frequency distributions to identify patterns"
   ✅ "Classify an element as a metal, metalloid, or nonmetal based on its position within the periodic table"

Examples of proper course-level objectives:
✅ "Determine the group number of an element based on its name, symbol, or atomic number"
✅ "Predict an element's tendency to lose or gain electrons based on its position within the periodic table"
✅ "Given a data set, calculate descriptive statistics to summarize central tendency and variability"
✅ "Evaluate the validity of a scientific claim using quantitative evidence"

WRONG (still too specific):
❌ "Identify the properties of arsenic using the periodic table"
❌ "Analyze arsenic contamination in water samples"
❌ "Calculate arsenic concentration from lab data"`
      : `SPECIFICITY REQUIREMENT:
Create TASK-SPECIFIC objectives that directly match the exact content, examples, and activities in this material.
- Use specific names, materials, and examples from the content
- Reference the actual tasks students will perform
- Include specific concepts and terminology mentioned
- Tie objectives directly to this particular assignment/activity

Examples of task-specific objectives:
✅ "Compare the chemical composition of silver halide and barium ferrite"
✅ "Calculate density of archival film samples using water displacement"
✅ "Identify compounds in ion mobility spectra using reference drift times"`;
    
    // Build user prompt
    const alignmentGuidance = framework === 'all'
      ? 'Align each objective to ALL applicable standards IN THE SAME alignment field, separated by " · ": include Bloom\'s Taxonomy level AND NGSS performance expectation codes (if science-related) AND CCSS codes (if ELA/Math-related). Example: "Bloom\'s: Analyze (Level 4) · NGSS HS-PS1-1: Use the periodic table as a model to predict relative properties of elements · CCSS.ELA-LITERACY.RST.11-12.7: Integrate and evaluate multiple sources of information". Use whichever frameworks genuinely apply; include at least Bloom\'s + one discipline code when relevant. Write out FULL standard descriptions without truncating.'
      : framework === 'ngss' 
      ? 'Align objectives to Next Generation Science Standards (NGSS) performance expectations when possible. Include scientific practices (e.g., "analyze data," "construct explanations," "develop models").'
      : framework === 'ccss'
      ? 'Align objectives to Common Core State Standards when possible. Use language from CCSS standards for reading, writing, or mathematics.'
      : 'Align objectives to appropriate Bloom\'s Taxonomy levels. Progress from foundational to higher-order thinking.';

    const userPrompt = `TASK: Extract exactly ${targetNumObjectives} discrete learning objectives from the content below.

CONTEXT:
- Audience level: ${audience_level}
${subject_area ? `- Subject area: ${subject_area}` : ''}
- Objective scope: ${objective_scope === 'course_level' ? 'COURSE-LEVEL (generalized)' : 'TASK-SPECIFIC (exact details)'}
- Framework: ${framework === 'all' ? 'All standards (Bloom\'s + NGSS + CCSS)' : framework}

${scopeGuidance}

CONTENT TO ANALYZE:
"""
${content_text.substring(0, 8000)}
"""

CRITICAL: Before generating objectives, identify ALL student tasks in the content:
- Questions with answer choices (e.g., "Which polymer has higher density? a) PETE b) Cellulose")
- Numbered directions or steps (e.g., "1. Weigh the sample 2. Add water 3. Measure volume")
- Lab procedures describing what students do (e.g., "Students will measure..., calculate..., observe...")
- Assessment items asking students to analyze, compare, evaluate, or conclude
- "Directions" sections that tell students what to do
- Feedback explanations that reveal what skill/knowledge is being tested

For each task found, create an objective that captures the required skill or knowledge.

INSTRUCTIONS:
1. **FIRST, scan the content for explicitly stated objectives or learning outcomes:**
   - Look for sections labeled: "objectives," "learning objectives," "outcomes," "students will," "you will complete"
   - Look for numbered lists or bullet points describing what students will do
   - Look for mission objectives, steps, or tasks explicitly stated
   - If explicit objectives are found, EXTRACT and REFORMAT them (do not create new ones)
   
2. **If explicit objectives exist:**
   - Extract each stated objective verbatim or with minimal rewording
   - Convert to proper learning objective format (start with action verb, student-centered)
   - Preserve specific details, examples, and terminology from the source
   - Generate EXACTLY ${targetNumObjectives} objectives by extracting the most important ones
   
3. **If no explicit objectives exist, REVERSE-ENGINEER objectives from student tasks:**
   - **Analyze what students are asked to DO in the assignment:**
     * Look for questions students must answer (e.g., "Which polymer has higher density?")
     * Look for calculations students must perform (e.g., "Calculate density using mass ÷ volume")
     * Look for procedures students must follow (e.g., "Measure mass, add water, record volume")
     * Look for analyses students must make (e.g., "Compare the flame colors to identify metals")
     * Look for decisions/judgments students must justify (e.g., "Determine which film matches the sample")
     * Look for data interpretation tasks (e.g., "Interpret the ion mobility spectrum")
     * Look for comparisons students must draw (e.g., "Compare PETE and cellulose structures")
   
   - **Convert each student task into a learning objective:**
     * Question: "Which polymer has higher density?" → Objective: "Predict which polymer has higher density based on molecular structure"
     * Calculation: "Calculate density = mass ÷ volume" → Objective: "Calculate density from mass and volume measurements"
     * Procedure: "Weigh film, add water, measure displacement" → Objective: "Measure density using water displacement method"
     * Analysis: "Compare flame colors to identify metals" → Objective: "Identify metal ions using flame test observations"
     * Lab directions: "Prepare sugar solution, observe if sample floats/sinks" → Objective: "Determine material identity using density comparison methods"
   
   - **Focus on the cognitive skills and content knowledge required:**
     * What must students understand to complete the task?
     * What skills must they demonstrate?
     * What concepts must they apply?
   
   - Generate EXACTLY ${targetNumObjectives} specific, measurable learning objectives based on these tasks
   
4. ${alignmentGuidance}

5. Order objectives by instructional priority (foundational concepts first, then applications)

6. CRITICAL: Match the EXACT STYLE of these examples:
   ✅ "Given a frequency distribution (e.g., histogram), estimate the proportion of data above a certain threshold."
   ✅ "Identify an element on the periodic table using its atomic number or number of protons."
   ✅ "Determine the group number of an element based on its name, symbol, or atomic number."
   ✅ "Predict an element's tendency to lose or gain electrons based on its position within the periodic table."
   
   NEVER write:
   ❌ "Students will identify elements..."
   ❌ "Learners will be able to determine..."
   ❌ "Understand periodic trends"

7. Ensure each objective:
   - Starts DIRECTLY with action verb OR "Given X, [action verb]..." (NO "Students will")
   - Is concise and specific (one discrete skill per objective)
   - Is granular and testable
   - ${objective_scope === 'course_level' ? 'Uses generalized terminology (e.g., "an element" not "arsenic")' : 'Uses specific terminology from the content'}

8. For alignment field:
  - If framework = "all": include MULTIPLE alignments in one string separated by " · " — always include Bloom's level; add NGSS codes/descriptions for science contexts; add CCSS codes/descriptions for ELA/Math contexts
  - Otherwise: include the most relevant single alignment (Bloom's level, NGSS code, or CCSS code)
  - Include standard codes AND complete descriptions (e.g., NGSS HS-PS1-1; CCSS.ELA-LITERACY.RST.11-12.7; CCSS.MATH.CONTENT.HSN.Q.A.3)
  - Write out FULL standard text; do NOT truncate with ellipsis (...) or abbreviate
  - If no specific standard applies, set to null
  - Max length: 300 characters (enough for full Bloom's + NGSS/CCSS descriptions)
  - Examples:
    * Bloom's only: "Bloom's: Analyze (Level 4)"
    * Multiple: "Bloom's: Apply (Level 3) · NGSS HS-PS1-3: Plan and conduct an investigation to gather evidence to compare structure of substances at bulk scale"

OBJECTIVE COUNT REQUIREMENT:
- There must be AT LEAST one objective per detected assessment item/question/step
- Generate EXACTLY ${targetNumObjectives} objectives such that each detected item is represented by at least one objective

OUTPUT: Return the JSON object with EXACTLY ${targetNumObjectives} learning objectives, ordered by instructional sequence.`;

    // Call OpenAI API
    console.log('Calling OpenAI API for learning objectives generation...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Low temperature for consistency
      max_tokens: 2000,
      response_format: { type: 'json_object' } // Force JSON output
    });

    const responseText = completion.choices[0].message.content;
    console.log('OpenAI response received');

    // Parse response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Response text:', responseText);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate response structure
    if (!result.learning_objectives || !Array.isArray(result.learning_objectives)) {
      throw new Error('Invalid response structure: missing learning_objectives array');
    }

    // Ensure metadata exists
    if (!result.metadata) {
      result.metadata = {};
    }

    // Fill in metadata
    result.metadata.audience_level = audience_level;
    result.metadata.subject_area = subject_area;
    result.metadata.objective_scope = objective_scope;
    result.metadata.framework = framework;
    result.metadata.source_file_ids = [];
    result.metadata.generated_at = new Date().toISOString();

    // Return successful response
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
