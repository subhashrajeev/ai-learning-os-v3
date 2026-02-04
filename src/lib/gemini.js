// Gemini AI Client for Learning System

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Get the model
function getModel() {
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// Generate personalized curriculum based on user profile
export async function generateCurriculum(profile) {
    const model = getModel();

    const prompt = `You are an expert Educational Architect designing a personalized AI learning journey.

USER PROFILE:
- Name: ${profile.name}
- Current Role: ${profile.role}
- Experience Level: ${profile.experience}
- Primary Goal: ${profile.goal}
- Specific Interests: ${profile.interests || 'General AI/ML'}
- Time Available: ${profile.timePerDay} per day
- Learning Style: ${profile.learningStyle}
- Current Skills: ${profile.currentSkills || 'Basic programming'}
- Preferred Language: ${profile.preferredLanguage || 'English'}

TASK:
Create a 7-Day Adaptive Micro-Learning Curriculum that:
1. Builds progressively from their current level
2. Aligns with their specific goal
3. Fits within their daily time constraint
4. Matches their learning style
5. Includes practical, actionable tasks

For each day, provide:
- A focused topic
- A clear learning objective (what they'll understand)
- A micro-action (hands-on task completable in the time available)
- Estimated completion time
- Difficulty level (1-5)

OUTPUT FORMAT (JSON ONLY, no markdown):
{
  "roadmap": [
    {
      "day": 1,
      "topic": "Topic Name",
      "objective": "By the end of this lesson, you will...",
      "action": "Build/Code/Explore...",
      "estimatedMinutes": 30,
      "difficulty": 2,
      "prerequisites": [],
      "keyTakeaways": ["takeaway1", "takeaway2"]
    }
  ],
  "totalEstimatedHours": 5,
  "skillsYouWillGain": ["skill1", "skill2"],
  "recommendedNextSteps": "After completing this sprint..."
}`;

    try {
        console.log('Generating curriculum with prompt:', prompt.substring(0, 100) + '...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Gemini Response:', text.substring(0, 100) + '...');

        // Clean up JSON if markdown tags exist
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error generating curriculum:', error);
        // Fallback for debugging
        if (error.message.includes('API key')) {
            throw new Error('Invalid or missing API key in .env.local. Please add your GEMINI_API_KEY.');
        }
        throw new Error('Failed to generate curriculum. ' + error.message);
    }
}

// Generate lesson content for a specific day
export async function generateLessonContent(topic, profile, dayInfo) {
    const model = getModel();

    const prompt = `You are creating an engaging micro-learning lesson for an AI learner.

LESSON TOPIC: "${topic}"
TARGET AUDIENCE: ${profile.role} (${profile.experience} level) aiming to ${profile.goal}
TIME AVAILABLE: ${profile.timePerDay}
LEARNING STYLE: ${profile.learningStyle}
DAY OBJECTIVE: ${dayInfo?.objective || 'Master this concept'}

Create a comprehensive but focused lesson with:

1. **Hook** (2-3 sentences): Start with WHY this matters and an intriguing fact
2. **Core Concept** (Simple explanation in 3-4 paragraphs with examples)
3. **Real-World Application** (How this is used in practice)
4. **Hands-On Exercise** (Step-by-step mini-project or code example)
5. **Key Takeaways** (3-4 bullet points)
6. **Reflection Question** (Thought-provoking question to solidify learning)
7. **Quick Challenge** (Optional stretch activity)
8. **TL;DR Summary** (2-3 bullet points)

FORMAT: Use markdown with clear headers. Include code blocks where relevant.
Make it engaging, practical, and actionable. Use analogies for complex concepts.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error generating lesson:', error);
        throw new Error('Failed to generate lesson content. Please try again.');
    }
}

// Generate practice quiz questions
export async function generateQuizQuestions(topic, profile, count = 5) {
    const model = getModel();

    const prompt = `Create ${count} quiz questions to test understanding of "${topic}" for a ${profile.experience} level learner.

Mix question types:
- Multiple choice (with 4 options, one correct)
- True/False
- Code analysis (if applicable)

For each question provide:
- The question text
- Options (for multiple choice)
- Correct answer
- Explanation of why it's correct
- Difficulty (easy/medium/hard)

OUTPUT FORMAT (JSON ONLY, no markdown):
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "This is correct because...",
      "difficulty": "medium"
    },
    {
      "id": 2,
      "type": "true_false",
      "question": "Statement here?",
      "correctAnswer": true,
      "explanation": "This is true/false because...",
      "difficulty": "easy"
    }
  ]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error generating quiz:', error);
        throw new Error('Failed to generate quiz. Please try again.');
    }
}

// Generate proactive daily suggestions
export async function generateProactiveSuggestions(profile, progress, context = {}) {
    const model = getModel();

    const prompt = `You are an AI learning concierge. Create 3 proactive, high-impact suggestions for today.

PROFILE:
- Role: ${profile.role}
- Goal: ${profile.goal}
- Time Available: ${profile.timePerDay}
- Learning Style: ${profile.learningStyle}

PROGRESS CONTEXT:
- Current Day: ${progress.currentDay}
- Lessons Completed: ${progress.lessonsCompleted}
- Quiz Average: ${progress.quizScore}%
- Due Reviews: ${context.dueReviews || 0}
- Memory Highlights: ${context.memoryHighlights || 0}

Each suggestion should include:
- title (short)
- action (specific, doable within their time)
- why (brief reason personalized to their goal)
- tag (Focus/Review/Build/Reflect)

OUTPUT FORMAT (JSON ONLY):
{
  "suggestions": [
    { "title": "...", "action": "...", "why": "...", "tag": "Review" }
  ]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return {
            suggestions: [
                {
                    title: 'Quick Review Sprint',
                    action: 'Review 2 key concepts from your last lesson and summarize them in 3 bullet points.',
                    why: 'Spaced repetition cements long-term memory for your goal.',
                    tag: 'Review',
                },
                {
                    title: 'Mini Build',
                    action: 'Implement a tiny demo related to today’s topic in 20 minutes.',
                    why: 'Hands-on practice accelerates practical mastery.',
                    tag: 'Build',
                },
                {
                    title: 'Reflect & Refocus',
                    action: 'Write one insight and one question from your learning today.',
                    why: 'Reflection improves retention and clarifies next steps.',
                    tag: 'Reflect',
                },
            ],
        };
    }
}

// Generate ecosystem updates
export async function generateEcosystemUpdates(interests, goal) {
    const model = getModel();

    const prompt = `You are a Tech Industry Analyst providing personalized AI ecosystem updates.

USER'S INTERESTS: ${interests || 'AI/ML general'}
USER'S GOAL: ${goal}

Generate 5 current and relevant updates about the AI ecosystem that matter to this learner.
Focus on:
- New models/frameworks relevant to their goals
- Industry trends they should know
- Research breakthroughs in their area of interest
- Practical tools or techniques
- Community developments

For each update provide:
- A catchy headline
- A brief description (2-3 sentences)
- Why it matters TO THIS SPECIFIC LEARNER
- A tag/category
- Relevance score (1-10) to their goals

OUTPUT FORMAT (JSON ONLY, no markdown):
{
  "updates": [
    {
      "id": 1,
      "headline": "Headline here",
      "description": "Brief description of the update...",
      "whyItMatters": "This matters for your goal of X because...",
      "tag": "Models",
      "relevanceScore": 9,
      "source": "General knowledge/Industry trends"
    }
  ],
  "lastUpdated": "February 2026",
  "weeklyDigest": "This week in AI for [goal]: Summary..."
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error generating ecosystem updates:', error);
        throw new Error('Failed to fetch ecosystem updates. Please try again.');
    }
}

// Analyze learning pace and suggest adjustments
export async function analyzeAndAdapt(profile, progress, curriculum) {
    const model = getModel();

    const prompt = `Analyze this learner's progress and suggest curriculum adaptations.

PROFILE:
- Role: ${profile.role}
- Goal: ${profile.goal}
- Time Available: ${profile.timePerDay}

PROGRESS:
- Days Completed: ${progress.completedDays?.length || 0} of 7
- Current Day: ${progress.currentDay}
- Quiz Score: ${progress.quizScore || 'N/A'}%
- Days Since Start: Calculate from ${progress.startDate}
- Last Active: ${progress.lastActiveDate}

CURRICULUM: ${JSON.stringify(curriculum?.roadmap?.slice(0, 3) || [])}

Provide:
1. Pace assessment (ahead/on-track/behind)
2. Recommendations for adjustment
3. Motivation message based on their progress
4. Suggested focus areas

OUTPUT FORMAT (JSON ONLY, no markdown):
{
  "paceAssessment": "on-track",
  "daysBehind": 0,
  "recommendations": ["recommendation1", "recommendation2"],
  "motivationMessage": "Personal message here...",
  "suggestedFocus": "Focus on X because...",
  "adjustedDifficulty": "same/easier/harder"
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Error analyzing progress:', error);
        return {
            paceAssessment: 'on-track',
            daysBehind: 0,
            recommendations: ['Keep up the great work!'],
            motivationMessage: 'You are making excellent progress on your learning journey!',
            suggestedFocus: 'Continue with your current path.',
            adjustedDifficulty: 'same'
        };
    }
}
