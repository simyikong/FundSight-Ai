from fastapi import APIRouter, HTTPException
from ...models.chat import ChatRequest, ChatResponse
from ...agents.chat_agent import ChatAgent
from ...agents.router_agent import RouterAgent
from ...agents.profile_agent import ProfileAgent
from ...agents.financial_agent import FinancialAgent
from ...agents.budget_agent import BudgetAgent
from ...agents.loan_agent import LoanAgent
from ...agents.document_agent import DocumentAgent

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
    'CatAgent': ChatAgent
}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Convert the request messages to the format expected by agents
        messages = [
            {
                "role": msg.role,
                "content": [
                    {
                        "text": item.text if item.text else None,
                        "file": item.file if hasattr(item, 'file') else None
                    }
                    for item in msg.content
                ]
            } for msg in request.messages
        ]

        agent_name = router_agent.route(messages).strip()
        
        if agent_name in AGENT_MAP:
            agent_class = AGENT_MAP[agent_name]
            agent = agent_class()
            response = list(agent.handle(messages))
        else:
            # Fallback to general chat agent
            response = list(chat_agent.handle(messages))

        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))