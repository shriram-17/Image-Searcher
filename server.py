from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests
import base64
import os
import uuid
from pathlib import Path

app = FastAPI(title="Image Description API")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class PollinationsRouter:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_base = "https://text.pollinations.ai/openai"
        
        self.models = {
            "gemini": "gemini-2.5-flash-lite",
            "openai-large": "gpt-5-chat",
            "openai": "gpt-5-mini",
        }
    
    def analyze_image(self, image_url: str, prompt: str, model_name: str = "gemini"):
        """Analyze image using Pollinations API"""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found.")
        
        payload = {
            "model": self.models[model_name],
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ],
            "seed": 101,
            "temperature": 0.7
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        try:
            response = requests.post(self.api_base, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            raise Exception(f"Error analyzing image: {e}")

# Initialize router
router = PollinationsRouter(api_key="vXXbvpzb8j1n26S8")

@app.get("/")
async def home():
    """Serve the frontend HTML"""
    return FileResponse("static/index.html")

@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    prompt: str = Form("Describe this image in detail."),
    model: str = Form("gemini")
):
    """Analyze uploaded image"""
    try:
        import time
        start_time = time.time()
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save uploaded file
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Convert to base64 for API
        with open(file_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode()
        
        # Create data URL
        mime_type = file.content_type
        image_url = f"data:{mime_type};base64,{image_data}"
        
        # Analyze with Pollinations API
        description = router.analyze_image(image_url, prompt, model)
        
        processing_time = round(time.time() - start_time, 2)
        
        return JSONResponse({
            "success": True,
            "description": description,
            "model_used": model,
            "processing_time": processing_time,
            "filename": unique_filename
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

class URLAnalysisRequest(BaseModel):
    image_url: str
    prompt: str = "Describe this image in detail."
    model: str = "gemini"

@app.post("/analyze-url")
async def analyze_url_image(request: URLAnalysisRequest):
    """Analyze image from URL"""
    try:
        import time
        start_time = time.time()
        
        # Analyze with Pollinations API
        description = router.analyze_image(request.image_url, request.prompt, request.model)
        
        processing_time = round(time.time() - start_time, 2)
        
        return JSONResponse({
            "success": True,
            "description": description,
            "model_used": request.model,
            "processing_time": processing_time
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Image Description API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)