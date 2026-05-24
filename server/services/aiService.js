const { GoogleGenAI } = require('@google/genai');

/**
 * Initialize Gemini Client helper
 */
const getGeminiClient = (apiKey) => {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Compares user skills to job description requirements
 */
const analyzeSkillGap = async (userSkills, jobDescription, apiKey) => {
  const client = getGeminiClient(apiKey);
  
  if (!client) {
    // Return high-quality Mock data in Demo Mode
    return getMockSkillGap(userSkills, jobDescription);
  }

  try {
    const prompt = `
      You are an expert career coach and tech recruiter. Analyze the user's current skills and compare them against the provided job description.
      
      User's Current Skills (scores out of 100):
      ${JSON.stringify(userSkills, null, 2)}
      
      Job Description:
      "${jobDescription}"
      
      Tasks:
      1. Extract the required skills, libraries, and frameworks from the job description.
      2. Rate the required level (10 to 95) and prioritize each skill as "high", "medium", or "low".
      3. Match them against the user's current skill levels.
      4. Calculate an overall Match Score (0 to 100).
      5. Identify the top gaps, calculating gap size (requiredLevel - currentLevel). Only include positive gaps (where requiredLevel > currentLevel).
      
      Return ONLY a JSON object matching this schema. Do not wrap in Markdown.
      {
        "matchScore": number,
        "jobRequirements": [
          { "skill": "string", "level": number, "priority": "high"|"medium"|"low" }
        ],
        "gaps": [
          { "skill": "string", "currentLevel": number, "requiredLevel": number, "gapSize": number, "priority": "high"|"medium"|"low" }
        ]
      }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Gemini analyzeSkillGap Error, falling back to mock:', error);
    return getMockSkillGap(userSkills, jobDescription);
  }
};

/**
 * Generates a 30, 60, or 90 day roadmap
 */
const generateRoadmap = async (gaps, duration, apiKey) => {
  const client = getGeminiClient(apiKey);

  if (!client) {
    return getMockRoadmap(gaps, duration);
  }

  try {
    const prompt = `
      You are an expert learning architect. Create a highly structured, week-by-week and day-by-day learning roadmap to bridge the following skill gaps over a ${duration}-day period.
      
      Skill Gaps to Address:
      ${JSON.stringify(gaps, null, 2)}
      
      Roadmap duration: ${duration} days.
      
      Generate a comprehensive study plan. Each week must have a clear "goal".
      Each day (1 to ${duration}) must have:
      - a specific "task" (concise action to take).
      - a "type": must be one of "read", "watch", "build", "practice".
      - a "resource" (suggested free resource, documentation link, or tutorial concept, e.g., "React Docs: State Lifecycle").
      
      Return ONLY a JSON array of weeks matching this schema:
      [
        {
          "weekNumber": number,
          "goal": "string",
          "days": [
            { "day": number, "task": "string", "type": "read"|"watch"|"build"|"practice", "resource": "string" }
          ]
        }
      ]
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Gemini generateRoadmap Error, falling back to mock:', error);
    return getMockRoadmap(gaps, duration);
  }
};

/**
 * Generates a personalized daily challenge
 */
const generateChallenge = async (skill, level, apiKey) => {
  const client = getGeminiClient(apiKey);

  if (!client) {
    return getMockChallenge(skill, level);
  }

  try {
    const prompt = `
      You are an expert coding coach. Generate a single daily challenge tailored to help the user learn the skill: "${skill}".
      The user's current level is ${level}/100.
      
      Determine an appropriate difficulty ("easy", "medium", or "hard") based on their level.
      Provide:
      - A "title" for the challenge.
      - A detailed "description" of the task.
      - A "type": "coding problem", "mini-project", "concept explanation", or "quiz".
      - If it is a "quiz", provide 4 options and the correctAnswer.
      - If it is a "coding problem", ask them to write code and provide starter syntax.
      
      Return ONLY a JSON object matching this schema:
      {
        "title": "string",
        "description": "string",
        "type": "coding problem"|"mini-project"|"concept explanation"|"quiz",
        "difficulty": "easy"|"medium"|"hard",
        "skill": "string",
        "options": ["string", "string", "string", "string"], // required only if type is 'quiz'
        "correctAnswer": "string" // required only if type is 'quiz'
      }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Gemini generateChallenge Error, falling back to mock:', error);
    return getMockChallenge(skill, level);
  }
};

/**
 * Generates resume bullets for a list of projects
 */
const generateResumeBullets = async (repoData, apiKey) => {
  const client = getGeminiClient(apiKey);

  if (!client) {
    return getMockResumeBullets(repoData);
  }

  try {
    const prompt = `
      You are a premium tech recruiter. Turn the following GitHub repository metadata into 3 strong, action-oriented resume bullet points.
      
      Repository Details:
      ${JSON.stringify(repoData, null, 2)}
      
      Format each bullet point to follow: Action Verb + Technology Used + Measurable/Impactful Outcome.
      Example: "Engineered a RESTful backend API with Node.js and Express, improving database query speeds by 30% through Mongoose index optimizations."
      
      Return ONLY a JSON object matching this schema:
      {
        "repoId": "string",
        "repoName": "string",
        "bullets": ["string", "string", "string"]
      }
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Gemini generateResumeBullets Error, falling back to mock:', error);
    return getMockResumeBullets(repoData);
  }
};

/**
 * AI Mentor Chat handler
 */
const mentorChat = async (messages, userContext, apiKey) => {
  const client = getGeminiClient(apiKey);

  if (!client) {
    return {
      content: getMockChatResponse(messages, userContext),
      isDemo: true
    };
  }

  try {
    // Format conversation history for Gemini API
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Inject system instructions as the model configuration
    const systemInstruction = `
      You are "SkillForge Mentor", a friendly, senior developer career advisor. 
      You are coaching a developer with the following profile details:
      - Username: ${userContext.username}
      - Skills breakdown: ${JSON.stringify(userContext.skills)}
      - Active Roadmap Progress: ${userContext.roadmapProgress || 0}%
      
      Help the user understand their skill gaps, suggest projects to build, explain complex code concepts, or conduct mock interview drills.
      Be encouraging, highly technical, and use markdown code snippets in your explanations. Keep answers focused and conversational.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });

    const resultText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    return {
      content: resultText,
      isDemo: false
    };
  } catch (error) {
    console.error('Gemini mentorChat Error, falling back to mock:', error);
    return {
      content: getMockChatResponse(messages, userContext),
      isDemo: true
    };
  }
};

/**
 * Mock Data Generators (Failsafes & Demo Mode)
 */

const getMockSkillGap = (userSkills, jobDescription) => {
  const lowercaseJD = jobDescription.toLowerCase();
  
  // Extract mock requirements based on keywords
  const possibleRequirements = [
    { skill: 'JavaScript', baseLevel: 80, priority: 'high' },
    { skill: 'React JS', baseLevel: 85, priority: 'high' },
    { skill: 'Node.js', baseLevel: 75, priority: 'high' },
    { skill: 'MongoDB', baseLevel: 70, priority: 'medium' },
    { skill: 'Docker', baseLevel: 65, priority: 'medium' },
    { skill: 'Tailwind CSS', baseLevel: 70, priority: 'low' },
    { skill: 'TypeScript', baseLevel: 80, priority: 'high' },
    { skill: 'Python', baseLevel: 85, priority: 'medium' },
    { skill: 'AWS', baseLevel: 70, priority: 'high' }
  ];

  const matchedRequirements = possibleRequirements.filter(req => 
    lowercaseJD.includes(req.skill.toLowerCase()) || 
    (req.skill === 'React JS' && lowercaseJD.includes('react')) ||
    (req.skill === 'Node.js' && lowercaseJD.includes('node'))
  );

  // If no keywords matched, default to full stack
  const finalRequirements = matchedRequirements.length > 0 ? matchedRequirements : possibleRequirements.slice(0, 5);

  const gaps = [];
  let scoreSum = 0;

  finalRequirements.forEach(req => {
    // Map categories to userSkills keys
    let userKey = req.skill;
    if (req.skill === 'React JS' || req.skill === 'Tailwind CSS') userKey = 'Frontend';
    if (req.skill === 'Node.js') userKey = 'Backend';
    if (req.skill === 'Docker' || req.skill === 'AWS') userKey = 'DevOps';
    if (req.skill === 'MongoDB') userKey = 'Database';

    const currentLvl = userSkills[userKey] || (userSkills.get ? userSkills.get(userKey) : 0) || Math.floor(10 + Math.random() * 30);
    const reqLvl = req.baseLevel;
    
    let matchContribution = 0;
    if (currentLvl >= reqLvl) {
      matchContribution = 100;
    } else {
      matchContribution = (currentLvl / reqLvl) * 100;
      gaps.push({
        skill: req.skill,
        currentLevel: currentLvl,
        requiredLevel: reqLvl,
        gapSize: reqLvl - currentLvl,
        priority: req.priority
      });
    }
    scoreSum += matchContribution;
  });

  const matchScore = Math.round(scoreSum / finalRequirements.length);

  return {
    matchScore: Math.max(10, Math.min(99, matchScore)),
    jobRequirements: finalRequirements.map(r => ({ skill: r.skill, level: r.baseLevel, priority: r.priority })),
    gaps: gaps.sort((a, b) => b.gapSize - a.gapSize),
    isDemo: true
  };
};

const getMockRoadmap = (gaps, duration) => {
  const weeksCount = Math.round(duration / 7);
  const weeks = [];
  
  // Default list of topics to learn if gaps is empty
  const learningTargets = gaps.length > 0 ? gaps.map(g => g.skill) : ['React Frontend', 'Node.js Backend', 'MongoDB Database'];

  for (let w = 1; w <= weeksCount; w++) {
    const focusSkill = learningTargets[(w - 1) % learningTargets.length];
    weeks.push({
      weekNumber: w,
      goal: `Master Core Foundations of ${focusSkill}`,
      days: Array.from({ length: 7 }).map((_, d) => {
        const dayNum = (w - 1) * 7 + (d + 1);
        if (dayNum > duration) return null;

        let type = 'read';
        let task = '';
        let resource = '';

        if (d === 0) {
          type = 'read';
          task = `Read core documentation regarding ${focusSkill} syntax and structures.`;
          resource = `${focusSkill} official website & docs`;
        } else if (d === 1) {
          type = 'watch';
          task = `Watch a comprehensive deep-dive video tutorial on ${focusSkill} patterns.`;
          resource = `YouTube: Learn ${focusSkill} in 60 Minutes`;
        } else if (d === 2 || d === 3) {
          type = 'practice';
          task = `Solve intermediate exercises implementing ${focusSkill} variables and operations.`;
          resource = `Codewars & LeetCode practice modules`;
        } else if (d === 4 || d === 5) {
          type = 'build';
          task = `Assemble a mini-application using ${focusSkill} (e.g. CRUD system or component library).`;
          resource = `GitHub templates & MDN Web Docs`;
        } else {
          type = 'practice';
          task = `Conduct a self-review exam and push a summary repository to GitHub.`;
          resource = `SkillForge Daily Challenge dashboard`;
        }

        return {
          day: dayNum,
          task,
          type,
          resource,
          completed: false
        };
      }).filter(Boolean)
    });
  }

  return weeks;
};

const getMockChallenge = (skill, level) => {
  const difficulty = level < 40 ? 'easy' : level < 75 ? 'medium' : 'hard';
  
  const codingChallenges = [
    {
      title: `Reverse Array Elements in ${skill}`,
      type: 'coding problem',
      description: `Write a function \`reverseArray(arr)\` that accepts an array and returns it in reverse order. Avoid using built-in reverse methods.\n\n\`\`\`javascript\n// Starter Code\nfunction reverseArray(arr) {\n  // Write your code here\n  \n}\n\`\`\``
    },
    {
      title: `${skill} Event Callback Implementation`,
      type: 'coding problem',
      description: `Design a custom emitter pattern. Implement a class \`EventEmitter\` with \`on(event, listener)\` and \`emit(event, data)\` functions.`
    },
    {
      title: `${skill} Scope and Closures Quiz`,
      type: 'quiz',
      description: `Evaluate the code segment and determine what is printed in the terminal:`,
      options: ['undefined', 'ReferenceError', '10', 'null'],
      correctAnswer: '10'
    },
    {
      title: `Build a Simple Router with ${skill}`,
      type: 'mini-project',
      description: `Create a vanilla HTML/JS state router that handles route updates dynamically without loading a new page. Intercept anchors and trigger state updates.`
    }
  ];

  // Pick a challenge based on skill name hash to make it semi-consistent
  const hash = skill.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const selected = codingChallenges[hash % codingChallenges.length];

  return {
    title: selected.title,
    description: selected.description,
    type: selected.type,
    difficulty,
    skill,
    options: selected.options || [],
    correctAnswer: selected.correctAnswer || '',
    isDemo: true
  };
};

const getMockResumeBullets = (repoData) => {
  const name = repoData.name || 'DeveloperProject';
  const lang = repoData.language || 'JavaScript';

  return {
    repoId: repoData.id || '12345',
    repoName: name,
    bullets: [
      `Architected and deployed "${name}" using ${lang}, establishing modular code architecture and reducing file load times by 20%.`,
      `Leveraged modern patterns in ${lang} to engineer automated workflows, increasing CI/CD pipeline deployment efficiency by 15%.`,
      `Authored clean, responsive features for "${name}" including state synchronization and unit tests, achieving 80%+ test coverage.`
    ],
    isDemo: true
  };
};

const getMockChatResponse = (messages, userContext) => {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (lastMessage.includes('weakness') || lastMessage.includes('gap')) {
    return `Looking at your skill metrics, your biggest development gap is in **DevOps** and **Databases**. \n\nWhile your Frontend is strong, recruiters for full-stack jobs look for experience with Docker, database optimization, and cloud hosts. I suggest we focus on configuring a MongoDB replica set or Dockerizing a backend project.`;
  }

  if (lastMessage.includes('project') || lastMessage.includes('build')) {
    return `Here is a highly recommended project to fill your current gaps:\n\n### Developer Job Search Tracker\n- **Backend:** Node.js + Express with MongoDB indices optimization.\n- **DevOps:** Package the app into a multi-stage Docker container.\n- **Frontend:** Build a clean dashboard visualizing application stages.\n\nThis project directly targets DevOps and Database categories which will raise your match scores significantly!`;
  }

  if (lastMessage.includes('interview')) {
    return `Let's practice a mock interview question! \n\n**Question:** Can you explain the difference between SQL indexes and MongoDB indexes? How do they improve performance? \n\nReply with your explanation, and I will evaluate it!`;
  }

  return `Hello ${userContext.username}! I am your SkillForge AI Mentor. \n\nI can help you review your **GitHub scan**, prepare for a **mock interview**, or outline a **learning plan** based on your target job description. \n\nWhat would you like to discuss today? You can try clicking one of the prompt chips below.`;
};

module.exports = {
  analyzeSkillGap,
  generateRoadmap,
  generateChallenge,
  generateResumeBullets,
  mentorChat
};
