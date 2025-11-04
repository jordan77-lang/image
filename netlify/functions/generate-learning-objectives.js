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
            objective_scope = 'task_specific',
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
        
        // Auto-detect number of objectives if set to 'auto'
        let targetNumObjectives;
        if (num_objectives === 'auto') {
            // Count activities, assessments, and major sections in content
            const content = content_text.toLowerCase();
            const activityIndicators = [
                /objective \d+:/gi,
                /objective \d+\./gi,
                /step \d+:/gi,
                /activity \d+/gi,
                /assessment \d+/gi,
                /assignment \d+/gi,
                /lab \d+/gi,
                /part \d+/gi,
                /section \d+/gi,
                /task \d+/gi,
                /exercise \d+/gi,
                /outcome \d+/gi,
                /you will complete this objective in \d+ steps/gi,
                /students will be able to/gi
            ];
            
            let detectedCount = 0;
            activityIndicators.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    // Avoid double-counting if multiple patterns match same text
                    detectedCount = Math.max(detectedCount, matches.length);
                }
            });
            
            // Look for explicitly numbered objectives (common pattern)
            const objectiveMatches = content.match(/objective \d+/gi);
            if (objectiveMatches) {
                // Extract the highest objective number
                const objectiveNumbers = objectiveMatches.map(m => parseInt(m.match(/\d+/)[0]));
                const maxObjective = Math.max(...objectiveNumbers);
                detectedCount = Math.max(detectedCount, maxObjective);
            }
            
            // Default to 5 if no activities detected, otherwise use detected count (max 15)
            targetNumObjectives = detectedCount > 0 ? Math.min(detectedCount, 15) : 5;
            console.log(`Auto-detected ${detectedCount} activities/assessments/objectives, generating ${targetNumObjectives} objectives`);
        } else {
            targetNumObjectives = parseInt(num_objectives) || 5;
        }    // Build system prompt with DSL standards
    const systemPrompt = `You are an expert curriculum-authoring assistant specializing in learning objectives design.

KEY PRINCIPLES:
- All objectives must be student-centered (describe what learners will do, not what instructors will teach)
- Use precise, measurable action verbs from Bloom's Taxonomy or domain-specific frameworks
- Each objective must be specific, observable, and assessable
- Follow ABCD format when appropriate: Audience, Behavior, Condition, Degree
- Avoid vague verbs like "understand," "know," "learn," "appreciate" — use concrete verbs like identify, analyze, calculate, design, evaluate
- Keep objectives concise (under 140 characters when possible)
- Objectives must be achievable within the scope described in the source content

BLOOM'S TAXONOMY VERBS BY LEVEL:
- Remember: define, list, identify, recall, recognize, state
- Understand: explain, describe, summarize, paraphrase, classify, compare
- Apply: use, solve, demonstrate, calculate, apply, predict, show
- Analyze: analyze, differentiate, distinguish, examine, investigate, categorize
- Evaluate: evaluate, assess, critique, judge, justify, defend, argue
- Create: create, design, construct, develop, formulate, compose, plan

FORMAT REQUIREMENTS:
- Start each objective with a strong action verb
- Use sentence case (capitalize first word only, unless proper nouns)
- No contractions, no em dashes
- Include conditions when relevant ("Given X, students will...")
- Include criteria when measurable ("...with 90% accuracy")

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
Create COURSE-LEVEL objectives that are broadly applicable across the entire course, not just this specific assignment.
- Replace specific examples with general categories (e.g., "silver halide and barium ferrite" → "metal salts")
- Use general concepts instead of specific instances (e.g., "archival film" → "materials")
- Remove proper nouns and specific names where possible
- Focus on transferable skills and concepts
- Make objectives reusable for multiple assignments/units

Examples of generalization:
❌ Task-specific: "Compare the chemical composition of silver halide and barium ferrite"
✅ Course-level: "Compare the chemical composition of metal salts"

❌ Task-specific: "Calculate density of archival film samples using water displacement"
✅ Course-level: "Calculate density of solid samples using displacement methods"

❌ Task-specific: "Analyze the French Revolution's causes using primary sources from 1789"
✅ Course-level: "Analyze historical events using primary source documents"`
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
      ? 'Align each objective to ALL applicable standards IN THE SAME alignment field, separated by " · ": include Bloom\'s Taxonomy level AND NGSS performance expectation codes (if science-related) AND CCSS codes (if ELA/Math-related). Example: "Bloom\'s: Analyze (Level 4) · NGSS HS-PS1-1: Use the periodic table as a model... · CCSS.ELA-LITERACY.RST.11-12.7: Integrate and evaluate multiple sources". Use whichever frameworks genuinely apply; include at least Bloom\'s + one discipline code when relevant.'
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

6. Ensure each objective:
   - Starts with a measurable action verb
   - Is student-centered ("Students will be able to..." or implied)
   - Is concise and specific
   - Can be assessed
   - ${objective_scope === 'course_level' ? 'Uses generalized terminology' : 'Uses specific terminology from the content'}

7. For alignment field:
  - If framework = "all": include MULTIPLE alignments in one string separated by " · " — always include Bloom's level; add NGSS codes/descriptions for science contexts; add CCSS codes/descriptions for ELA/Math contexts
  - Otherwise: include the most relevant single alignment (Bloom's level, NGSS code, or CCSS code)
  - Include standard codes when available (e.g., NGSS HS-PS1-1; CCSS.ELA-LITERACY.RST.11-12.7; CCSS.MATH.CONTENT.HSN.Q.A.3)
  - If no specific standard applies, set to null
  - Examples:
    * Bloom's only: "Bloom's: Analyze (Level 4)"
    * Multiple: "Bloom's: Apply (Level 3) · NGSS HS-PS1-3: Plan and conduct an investigation..."

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
