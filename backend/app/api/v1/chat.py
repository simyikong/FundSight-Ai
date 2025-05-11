import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
from ...models.chat_model import ChatRequest, ChatResponse
from ...agents.chat_agent import ChatAgent
from ...agents.router_agent import RouterAgent
from ...agents.profile_agent import ProfileAgent
from ...agents.financial_agent import FinancialAgent
from ...agents.budget_agent import BudgetAgent
from ...agents.loan_agent import LoanAgent
from ...agents.document_agent import DocumentAgent
import logging
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

router = APIRouter()
chat_agent = ChatAgent()
router_agent = RouterAgent()

# Map router output names to agent classes
AGENT_MAP = {
    'ProfileAssistant': ProfileAgent,
    'FinancialAdvisor': FinancialAgent,
    'BudgetPlanner': BudgetAgent,
    'LoanAgent': LoanAgent,
    'DocumentAgent': DocumentAgent,
    'ChatAgent': ChatAgent
}

def _clean_ollama_response(text):
    # Remove <think>...</think> (including multiline content)
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

    lines = text.strip().splitlines()
    cleaned_lines = [line.strip() for line in lines if line.strip() != ""]
    
    return "\n".join(cleaned_lines)

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        messages = [
            {
                "role": "user",
                "content": request.query
            }
        ]
        # Route the query to the appropriate agent
        # agent_name = router_agent.route(messages).strip()
        # print(agent_name)
        # if agent_name in AGENT_MAP:
        #     agent_class = AGENT_MAP[agent_name]
        #     agent = agent_class()
        #     response = list(agent.handle(messages))
        # else:
        #     # Fallback to general chat agent
        try:
            response_text = _clean_ollama_response(chat_agent.handle(messages))
            try:
                response = json.loads(response_text)
            except json.JSONDecodeError:
                response = response_text
            return {"response": response}

        except Exception as agent_error:
            logger.error(f"Error in chat agent: {str(agent_error)}", exc_info=True)
            raise

    except Exception as e:
        logger.error(f"Unhandled error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))