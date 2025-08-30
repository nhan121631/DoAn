import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")
MODEL = "gemini-2.0-flash"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

def chat_with_gemini(messages):
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [
            {"parts": [{"text": msg} for msg in messages]}
        ]
    }
    response = requests.post(URL, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

# Ví dụ sử dụng:
if __name__ == "__main__":
    messages = ["Xin chào Gemini!"]
    result = chat_with_gemini(messages)
    print(result)