import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Configure Gemini - API key loaded from environment variable
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class LearningEngine:
    def __init__(self):
        # Switched to gemini-2.0-flash (confirmed available)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def generate_curriculum(self, user_profile):
        """Generates a structured learning path based on user profile."""
        prompt = f"""
        Act as an expert Educational Architect for an AI Learning System.
        
        USER PROFILE:
        - Current Role: {user_profile.get('role', 'Beginner')}
        - Target Goal: {user_profile.get('goal', 'Learn AI')}
        - Time Available: {user_profile.get('time_per_day', '30 mins')} per day
        - Learning Style: {user_profile.get('style', 'Practical/Hands-on')}
        - Current Skills: {user_profile.get('skills', 'None')}

        TASK:
        Create a 7-Day Micro-Learning Curriculum.
        Each day must have:
        1. A specific Topic.
        2. A clear Learning Objective.
        3. A 'Micro-Action' (something to build/do in < 20 mins).
        
        OUTPUT FORMAT (JSON ONLY):
        {{
            "roadmap": [
                {{
                    "day": 1,
                    "topic": "...",
                    "objective": "...",
                    "action": "..."
                }},
                ...
            ]
        }}
        """
        try:
            response = self.model.generate_content(prompt)
            # Clean up json if markdown tags exist
            text = response.text.replace('```json', '').replace('```', '')
            print(f"DEBUG RAW RESPONSE: {text}") # ADDED DEBUG PRINT
            return json.loads(text)
        except Exception as e:
            print(f"DEBUG ERROR: {str(e)}") # ADDED DEBUG PRINT
            return {"roadmap": [{"day": 1, "topic": "Error Generation", "objective": f"Check Terminal: {str(e)}", "action": "Retry"}]}

    def generate_daily_lesson(self, topic, user_profile):
        """Generates the actual content for a specific day."""
        prompt = f"""
        Generate a micro-learning lesson for the topic: "{topic}".
        Target Audience: {user_profile.get('role')} aiming for {user_profile.get('goal')}.
        Time Constraint: {user_profile.get('time_per_day')}.
        
        Structure:
        1. **The Core Concept** (Explain it simply in 3 sentences).
        2. **Why It Matters** (Context).
        3. **The Micro-Action** (Step-by-step instruction).
        4. **Reflection Question**.
        """
        response = self.model.generate_content(prompt)
        return response.text

    def get_ecosystem_updates(self, interests):
        """Generates an 'Analyst Pulse Check' based on Gemini's internal knowledge."""
        # FALLBACK: Live search is flaky, so we use Gemini as a "Knowledge Analyst"
        # It has knowledge up to late 2024/2025 (depending on model), which is good for a demo.
        
        prompt = f"""
        Act as a Tech News Analyst.
        
        TOPIC: {interests}
        
        TASK:
        Generate a "Pulse Check" news update with 3 distinct items that represent the latest trends, research directions, or industry shifts in this topic.
        
        Format it like a newsletter:
        1. **Headline** (Punchy)
        2. *Context* (Why it matters now)
        
        Make it sound CURRENT and URGENT.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"⚠️ Analyst unavailable. (Error: {str(e)})"
