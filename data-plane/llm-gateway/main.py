from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re

app = FastAPI(title="LLM Privacy Gateway - BYOC Data Plane")

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
    Mock implementation of Context-Preserving Masking (Virtual Tokenization).
    Detects patterns like SSN/Aadhaar/Email and replaces them with a token.
    """
    token_map = {}
    
    # Mock Aadhaar (12 digits)
    aadhaar_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
    # Mock Email
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

    def replace_aadhaar(match):
        token = f"<AADHAAR_{len(token_map)}>"
        token_map[token] = match.group(0)
        return token

    def replace_email(match):
        token = f"<EMAIL_{len(token_map)}>"
        token_map[token] = match.group(0)
        return token

    text_tokenized = re.sub(aadhaar_pattern, replace_aadhaar, text)
    text_tokenized = re.sub(email_pattern, replace_email, text_tokenized)

    return TokenizedData(
        original=text,
        tokenized=text_tokenized,
        token_map=token_map
    )

def detokenize(text: str, token_map: dict) -> str:
    """
    Restores the original PII into the LLM output before returning to user.
    """
    for token, original_value in token_map.items():
        text = text.replace(token, original_value)
    return text

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
    final_response = detokenize(llm_text, token_map=tokenized_data.token_map)
    
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
