import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def find_working_model():
    key = os.getenv("GOOGLE_API_KEY")
    print(f"Testing with key: {key[:10]}...")
    genai.configure(api_key=key)
    
    try:
        print("Listing accessible models...")
        accessible_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                accessible_models.append(m.name)
                print(f"Found: {m.name}")
        
        if not accessible_models:
            print("No models found with generateContent permission.")
            return
            
        print("\nTrying to generate content with the first found model...")
        test_model = accessible_models[0]
        model = genai.GenerativeModel(test_model)
        response = model.generate_content("Say 'Connection Successful'")
        print(f"Success with {test_model}: {response.text}")
        
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    find_working_model()
