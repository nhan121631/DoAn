"""
Test API Gemini với models mới (từ API official response)
"""
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

print("=" * 80)
print("🧪 TEST GEMINI API - MODELS MỚI NHẤT")
print("=" * 80)
print(f"API Key: {API_KEY[:20]}...{API_KEY[-10:]}")
print()

# Danh sách models từ API official response
models_to_test = [
    "gemini-2.5-flash",          # ⭐ Recommend
    "gemini-flash-latest",       # Auto-update
    "gemini-2.0-flash-lite",     # Fast & light
    "gemini-2.0-flash",          # Stable
    "gemini-pro-latest",         # Pro version
    "gemini-2.5-pro",            # Most powerful
]

test_prompt = "Say 'Hello from Gemini!' in English."

for model in models_to_test:
    print(f"\n{'='*80}")
    print(f"Testing: {model}")
    print("="*80)
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": test_prompt}]
        }]
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            reply = result["candidates"][0]["content"]["parts"][0]["text"]
            print(f"✅ SUCCESS")
            print(f"📝 Response: {reply.strip()}")
            
        elif response.status_code == 404:
            error_data = response.json()
            error_msg = error_data.get('error', {}).get('message', 'Unknown error')
            print(f"❌ NOT FOUND (404)")
            print(f"   Error: {error_msg}")
            
        elif response.status_code == 429:
            print(f"⚠️ RATE LIMITED (429)")
            print(f"   Model exists but too many requests")
            print(f"   Try again in a few minutes")
            
        elif response.status_code == 400:
            error_data = response.json()
            error_msg = error_data.get('error', {}).get('message', 'Unknown error')
            print(f"❌ BAD REQUEST (400)")
            print(f"   Error: {error_msg}")
            
        else:
            print(f"❓ UNKNOWN STATUS: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        print(f"⏱️ TIMEOUT - Request took too long")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

print("\n" + "=" * 80)
print("🏁 TEST COMPLETED")
print("=" * 80)
print("\n💡 RECOMMENDATIONS:")
print("✅ Use models that showed SUCCESS")
print("⚠️ If RATE LIMITED, wait 1-2 minutes or use another API key")
print("❌ If NOT FOUND, that model is not available for your API key")
print("\n🔗 Useful links:")
print("   - API Keys: https://aistudio.google.com/app/apikey")
print("   - Documentation: https://ai.google.dev/api/rest")
print("   - Quota: https://console.cloud.google.com/")
print("=" * 80)
