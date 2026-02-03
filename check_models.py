import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyA-kEVlQrFkpj69iQfsx-ZE75P3hlhMoqI")

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")
