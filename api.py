import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()

client = Cerebras(
    api_key= os.getenv("Cerberes_api_key")
)

stream = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "Hello How are You"
        }
    ],
    model="llama-4-maverick-17b-128e-instruct",
    stream=True,
    max_completion_tokens=32768,
    temperature=0.6,
    top_p=0.9
)

for chunk in stream:
  print(chunk.choices[0].delta.content or "", end="")