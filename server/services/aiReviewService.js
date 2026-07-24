const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-flash-latest'; // alias — always points to the current stable free-tier Flash model
const MAX_CHARS_PER_FILE = 6000;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    scores: {
      type: 'object',
      properties: {
        security: { type: 'number' },
        performance: { type: 'number' },
        maintainability: { type: 'number' }
      },
      required: ['security', 'performance', 'maintainability']
    },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['bug', 'security', 'performance', 'quality'] },
          file: { type: 'string' },
          line: { type: 'number', nullable: true },
          message: { type: 'string' }
        },
        required: ['category', 'file', 'message']
      }
    }
  },
  required: ['scores', 'findings']
};

function buildPrompt(fileChunks) {
  const fileSections = fileChunks.map((chunk) => {
    const rawText = chunk.patch || chunk.content || '';
    const truncated = rawText.length > MAX_CHARS_PER_FILE;
    const text = truncated ? rawText.slice(0, MAX_CHARS_PER_FILE) : rawText;
    return `### File: ${chunk.filename}${truncated ? ' (TRUNCATED — showing first ' + MAX_CHARS_PER_FILE + ' characters)' : ''}\n${text}`;
  }).join('\n\n');

  return `You are a senior software engineer performing a code review. Review ONLY the code provided below. Do not invent files or issues that are not present in the given content.

For each issue you find, categorize it as one of: "bug", "security", "performance", or "quality".
For each finding, include the exact file name it applies to, a line number if you can identify one (or null if not applicable), and a short, clear, human-readable explanation.

Also produce three scores from 0-100:
- security: how secure the code is (100 = no security concerns)
- performance: how performant the code is (100 = no performance concerns)
- maintainability: how clean/readable/maintainable the code is (100 = excellent)

Respond with ONLY valid JSON matching this exact shape, no extra commentary, no markdown formatting:
{
  "scores": { "security": 0-100, "performance": 0-100, "maintainability": 0-100 },
  "findings": [
    { "category": "bug|security|performance|quality", "file": "filename", "line": number or null, "message": "explanation" }
  ]
}

If no issues are found, return an empty "findings" array and high scores.

CODE TO REVIEW:
${fileSections}`;
}

function stripCodeFences(text) {
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
}

function isValidShape(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.scores || typeof obj.scores !== 'object') return false;
  const { security, performance, maintainability } = obj.scores;
  if (typeof security !== 'number' || typeof performance !== 'number' || typeof maintainability !== 'number') return false;
  if (!Array.isArray(obj.findings)) return false;
  return true;
}

async function callGemini(prompt) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  });
  return response.text;
}

async function reviewCode(fileChunks) {
  if (!fileChunks || fileChunks.length === 0) {
    throw new Error('No file content provided for review');
  }

  const prompt = buildPrompt(fileChunks);

  let rawText;
  try {
    rawText = await callGemini(prompt);
  } catch (err) {
    throw new Error('AI_API_FAILURE: ' + err.message);
  }

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFences(rawText));
  } catch (err) {
    // Retry once with a stricter corrective instruction
    try {
      const retryPrompt = prompt + '\n\nYour previous response was not valid JSON. Respond with ONLY the raw JSON object, nothing else — no markdown, no commentary, no code fences.';
      const retryText = await callGemini(retryPrompt);
      parsed = JSON.parse(stripCodeFences(retryText));
    } catch (retryErr) {
      throw new Error('AI_PARSE_FAILURE: Could not parse AI response as JSON after retry');
    }
  }

  if (!isValidShape(parsed)) {
    throw new Error('AI_SCHEMA_FAILURE: AI response did not match expected shape');
  }

  return parsed;
}

module.exports = { reviewCode };