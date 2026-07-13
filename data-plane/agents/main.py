from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
import httpx
import json
import os
import asyncio

API_KEY = os.getenv("API_KEY", "enterprise-secret-key-123")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")

app = FastAPI(title="HR Onboarding Agent - Micro-Agent Workflow", dependencies=[Depends(verify_api_key)])

CONTROL_PLANE_URL = os.getenv("CONTROL_PLANE_URL", "http://localhost:3000")

class OnboardingRequest(BaseModel):
    employee_name: str
    department: str
    onboarding_chat_transcript: str

# --- MOCK TOOL REGISTRY ---
class JiraConnector:
    @staticmethod
    def create_ticket(title: str, description: str):
        print(f"[JIRA] Created ticket: {title}")
        return {"status": "success", "ticket_id": "IT-1023"}

class ActiveDirectoryConnector:
    @staticmethod
    def provision_user(name: str, department: str):
        print(f"[AD] Provisioning user {name} in {department}")
        return {"status": "success", "user_id": f"{name.lower().replace(' ', '.')}"}
# --------------------------

async def request_hitl_approval(agent_name: str, action_type: str, payload: dict):
    """Sends a request to the Control Plane for Human-in-the-loop approval."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CONTROL_PLANE_URL}/api/approvals",
                json={
                    "agentName": agent_name,
                    "actionType": action_type,
                    "payload": payload
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Failed to request HITL approval: {e}")
        # Return a mock pending ID for local dev if UI is unreachable
        return {"id": "mock-pending-id-123", "status": "PENDING"}

@app.post("/v1/agents/hr-onboarding")
async def process_onboarding(request: OnboardingRequest):
    # 1. Extract information from the transcript via the LLM Gateway.
    prompt = f"""
    You are an intelligent HR Onboarding Agent. 
    Extract the following from the user's transcript:
    1. Any mentioned hardware requests (e.g. laptop, monitor).
    2. Any personal identification information (this should be securely masked by the gateway).
    
    Transcript: "{request.onboarding_chat_transcript}"
    
    Return your response as a structured summary.
    """
    
    # 2. Call the LLM Gateway
    gateway_url = "http://localhost:8000/v1/completions" # Using localhost for testing
    payload = {
        "model": "llama-3-8b",
        "prompt": prompt
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(gateway_url, json=payload, headers={"X-API-Key": API_KEY}, timeout=60.0)
            response.raise_for_status()
            gateway_response = response.json()
            llm_text = gateway_response.get("choices", [{}])[0].get("text", "")
    except Exception as e:
        # Fallback for local testing
        print(f"Warning: Gateway unreachable, using fallback text. {e}")
        llm_text = "Detected request for Macbook Pro. Detected employee AD grouping requirement."

    # 3. Agent Tool Execution Engine
    actions_taken = []
    
    # Low Risk Action: Create Jira Ticket for hardware
    jira_result = JiraConnector.create_ticket(
        title=f"Hardware Provisioning - {request.employee_name}", 
        description=llm_text
    )
    actions_taken.append(f"LOW RISK (Auto-Executed): Jira Ticket {jira_result['ticket_id']}")
    
    # High Risk Action: Active Directory Provisioning -> Requires HITL
    approval_request = await request_hitl_approval(
        agent_name="HR Onboarding Agent",
        action_type="ActiveDirectory_Provision",
        payload={"employee_name": request.employee_name, "department": request.department}
    )
    actions_taken.append(f"HIGH RISK (Paused): AD Provisioning is {approval_request.get('status')} (ID: {approval_request.get('id')})")

    return {
        "status": "success_partial_pending",
        "agent": "hr-onboarding",
        "employee_name": request.employee_name,
        "llm_analysis": llm_text,
        "actions_taken": actions_taken,
        "message": "Workflow paused. Awaiting human administrator approval in the Control Plane."
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "hr-agent"}
