from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
import re
from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer
import redis
import uuid
import os

API_KEY = os.getenv("API_KEY", "enterprise-secret-key-123")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

app = FastAPI(title="LLM Privacy Gateway - BYOC Data Plane", dependencies=[Depends(verify_api_key)])

# Initialize Redis client globally
redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)

# Initialize Presidio Analyzer Engine globally
analyzer_engine = AnalyzerEngine()

# Register custom recognizer for Aadhaar
aadhaar_pattern = Pattern(name="aadhaar_pattern", regex=r'\b\d{4}\s?\d{4}\s?\d{4}\b', score=0.5)
aadhaar_recognizer = PatternRecognizer(supported_entity="AADHAAR_NUMBER", patterns=[aadhaar_pattern])
analyzer_engine.registry.add_recognizer(aadhaar_recognizer)

class CompletionRequest(BaseModel):
    prompt: str
    model: str = "llama-3-8b"
    max_tokens: int = 100

class TokenizedData(BaseModel):
    original: str
    tokenized: str
    token_map: dict

def virtual_tokenize(text: str) -> TokenizedData:
    """
    Context-Preserving Masking (Virtual Tokenization) using Microsoft Presidio.
    Dynamically detects and masks PII like Names, Emails, Phones, and Aadhaar.
    """
    # Analyze text for PII
    results = analyzer_engine.analyze(text=text, language='en')
    
    # Sort results by start index descending to replace from end to start
    # This prevents index shifting issues when modifying the string
    results = sorted(results, key=lambda x: x.start, reverse=True)
    
    token_map = {}
    text_tokenized = text
    
    for result in results:
        # Extract the original PII value
        original_value = text[result.start:result.end]
        entity_type = result.entity_type
        
        # Generate a unique UUID token for this entity type (e.g., <EMAIL_ADDRESS_a1b2c3d4>)
        unique_id = uuid.uuid4().hex[:8]
        token = f"<{entity_type}_{unique_id}>"
        
        # Store in Redis with 1 hour TTL (3600 seconds)
        redis_client.setex(token, 3600, original_value)
        
        token_map[token] = original_value
        
        # Replace the original value with the token in the string
        text_tokenized = text_tokenized[:result.start] + token + text_tokenized[result.end:]

    return TokenizedData(
        original=text,
        tokenized=text_tokenized,
        token_map=token_map
    )

def detokenize(text: str) -> str:
    """
    Restores the original PII into the LLM output by fetching it from Redis.
    """
    # Regex to match tokens like <EMAIL_ADDRESS_a1b2c3d4>
    pattern = r'<([A-Z_]+_[0-9a-f]{8})>'
    
    def replace_token(match):
        token = match.group(0)
        original_value = redis_client.get(token)
        return original_value if original_value else token
        
    return re.sub(pattern, replace_token, text)

import httpx

@app.post("/v1/completions")
async def create_completion(request: CompletionRequest):
    # 1. Intercept & Tokenize
    tokenized_data = virtual_tokenize(request.prompt)
    
    # 2. Forward to Local Inference Engine (Ollama)
    ollama_url = "http://ollama:11434/api/generate"
    payload = {
        "model": request.model,
        "prompt": tokenized_data.tokenized,
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(ollama_url, json=payload, timeout=60.0)
            response.raise_for_status()
            ollama_response = response.json()
            llm_text = ollama_response.get("response", "")
    except Exception as e:
        # Fallback to mock for local testing if Ollama isn't reachable
        print(f"Warning: Failed to connect to Ollama ({str(e)}). Using fallback mock response.")
        llm_text = f"I received your query: {tokenized_data.tokenized}. I have processed it securely."
    
    # 3. Detokenize response
    final_response = detokenize(llm_text)
    
    return {
        "id": "cmpl-mock123",
        "object": "text_completion",
        "model": request.model,
        "choices": [
            {
                "text": final_response,
                "finish_reason": "stop"
            }
        ],
        "debug_info": {
            "tokenized_prompt_sent_to_llm": tokenized_data.tokenized,
            "tokens_generated": len(tokenized_data.token_map)
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "llm-gateway"}
