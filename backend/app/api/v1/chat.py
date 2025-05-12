import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
from ...models.chat_model import ChatRequest, ChatResponse, Message
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
    'ProfileAgent': ProfileAgent,
    'FinancialAgent': FinancialAgent,
    'BudgetAgent': BudgetAgent,
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
        logger.info(f"Received request: {request}")
        # Convert Message objects to dictionaries
        messages = [
            {'role': msg.role, 'content': msg.content} 
            for msg in (request.message_history if request.message_history else [])
        ]
        
        # Add new user message
        if not request.file:
            messages.append({'role': 'user', 'content': request.query})
        else:
            messages.append({'role': 'user', 'content': [{'text': request.query}]})
            if request.file:
                messages[-1]['content'].append({'file': request.file})

        # Route the query to the appropriate agent
        agent_name = router_agent.handle(messages).strip()
        agent_name = _clean_ollama_response(agent_name)
        logger.info(f"Routing to agent: {agent_name}")
        
        if agent_name in AGENT_MAP:
            agent_class = AGENT_MAP[agent_name]
            agent = agent_class()
            response_text = _clean_ollama_response(agent.handle(messages))
        else:
            response_text = _clean_ollama_response(chat_agent.handle(messages))
            
        try:
            llm_response = json.loads(response_text)
        except json.JSONDecodeError:
            llm_response = response_text
        
        switch_tab = None
        if agent_name == 'FinancialAgent':
            switch_tab = 'Dashboard'
        elif agent_name == 'LoanAgent':
            switch_tab = 'Loan'

        return {"response": llm_response, "switch_tab": switch_tab}

    except Exception as e:
        logger.error(f"Error in processing response in chatbot: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))