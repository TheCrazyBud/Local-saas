from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import json

app = FastAPI(title="HR Onboarding Agent - Micro-Agent Workflow")

class OnboardingRequest(BaseModel):
    employee_name: str
    department: str
    onboarding_chat_transcript: str

@app.post("/v1/agents/hr-onboarding")
async def process_onboarding(request: OnboardingRequest):
    # The agent orchestrates a workflow. 
    # 1. It extracts information from the transcript via the LLM Gateway.
    
    prompt = f"""
    You are an intelligent HR Onboarding Agent. 
    Extract the following from the user's transcript:
    1. Any mentioned hardware requests (e.g. laptop, monitor).
    2. Any personal identification information (this should be securely masked by the gateway).
    
    Transcript: "{request.onboarding_chat_transcript}"
    
    Return your response as a structured summary.
    """
    
    # 2. Call the LLM Gateway
    gateway_url = "http://llm-gateway:8000/v1/completions"
    payload = {
        "model": "llama-3-8b",
        "prompt": prompt
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(gateway_url, json=payload, timeout=60.0)
            response.raise_for_status()
            gateway_response = response.json()
            llm_text = gateway_response.get("choices", [{}])[0].get("text", "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent failed to contact LLM Gateway: {str(e)}")

    # 3. Emulate downstream automated provisioning (Kafka event, Jira ticket, etc)
    return {
        "status": "success",
        "agent": "hr-onboarding",
        "employee_name": request.employee_name,
        "department": request.department,
        "llm_analysis": llm_text,
        "actions_taken": [
            "Triggered Active Directory group assignment",
            "Created IT hardware provisioning ticket",
            "Logged compliance documentation"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "hr-agent"}
