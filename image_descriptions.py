import requests
import json

# 1. Define the API endpoint
url = "https://text.pollinations.ai/openai"

# 2. Set the headers
headers = {
    "Content-Type": "application/json"
}

# 3. Construct the JSON payload with the multimodal content
payload = {
    "model": "gpt-5-nano",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                    }
                }
            ]
        }
    ]
}

# 4. Make the POST request
print("Sending request to Pollinations AI...")
try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    # 5. Check the response and print the result
    if response.status_code == 200:
        # The response is typically a JSON object similar to OpenAI's
        response_data = response.json()
        # Extract the message content from the response
        content = response_data['choices'][0]['message']['content']
        
        print("\n--- Image Description ---")
        print(content)
        print("-----------------------")
        
    else:
        print(f"Error: Received status code {response.status_code}")
        print(f"Response: {response.text}")

except requests.exceptions.RequestException as e:
    print(f"An error occurred: {e}")

