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
from ...agents.insight_agent import InsightAgent
from ...agents.mcp_agent import MCPAgent
import logging
import json
import asyncio
import os
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the project root directory
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

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
    'ChatAgent': ChatAgent,
    'InsightAgent': InsightAgent,
    'MCPAgent': MCPAgent,
}

def _clean_ollama_response(text):
    # Remove <think>...</think> (including multiline content)
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)

    lines = text.strip().splitlines()
    cleaned_lines = [line.strip() for line in lines if line.strip() != ""]
    
    return "\n".join(cleaned_lines)

def _clean_response(text):
    cleaned = re.sub(r'\[TOOL_CALL\].*?\[TOOL_RESPONSE\]', '', text, flags=re.DOTALL)
    match = re.search(r'(Here is the line chart.*)', cleaned, re.DOTALL)
    if match:
        return match.group(1).strip()
    return cleaned.strip()
    
async def stream_response(messages, agent):
    try:
        prev_chunk = ""
        for chunk in agent.handle(messages=messages):
            if chunk.strip() == "" and prev_chunk.strip() == "":
                chunk = "\n "  
            elif chunk.strip() == "":
                chunk = " "
            prev_chunk = chunk  
            yield f"data: {json.dumps({'content': chunk})}\n\n"
            await asyncio.sleep(0.01)  
    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

async def stream_tool_response(messages, agent):
    try:
        buffer = ""
        for chunk in agent.handle(messages=messages):
            if chunk.strip() == "":
                chunk = " "
            buffer += chunk
        logger.info(f"Buffer: {buffer}")        
        cleaned_response = _clean_response(buffer)
        logger.info(f"Cleaned response: {cleaned_response}")

        yield f"data: {json.dumps({'content': cleaned_response})}\n\n"
        await asyncio.sleep(0.01)  
    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

async def stream_image_response(messages, agent):
    try:
        # Get the response from agent
        agent.handle(messages=messages)
        
        # Use the fixed path for the chart image
        image_path = os.path.join(PROJECT_ROOT, "backend", "workspace", "tools", "code_interpreter", "chart.png")
        
        # Read the image file
        with open(image_path, 'rb') as f:
            image_data = f.read()
            
        # Convert to base64
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Send the image data to frontend
        response_data = {
            'content': 'The chart has been generated successfully.',
            'image_data': base64_image
        }
        
        yield f"data: {json.dumps(response_data)}\n\n"
        await asyncio.sleep(0.01)
    except Exception as e:
        logger.error(f"Error in streaming image response: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

async def stream_json_response(messages, agent):
    try:
        buffer = ""
        loan_data = {}
        for chunk in agent.handle(messages=messages):
            cleaned_chunk = _clean_ollama_response(chunk)
            if cleaned_chunk.strip() == "":
                cleaned_chunk = " "
            
            # Add to buffer
            buffer += cleaned_chunk

            try:
                # Try to parse the buffer as JSON
                json_data = json.loads(buffer)
                if "message" in json_data:
                    # Extract loan data if present
                    if "funding_purpose" in json_data:
                        loan_data["funding_purpose"] = json_data["funding_purpose"]
                    if "requested_amount" in json_data:
                        loan_data["requested_amount"] = json_data["requested_amount"]
                    if "suggest_loan" in json_data:
                        loan_data["suggest_loan"] = json_data["suggest_loan"]
                    
                    # Stream both message content and loan data
                    response_data = {
                        'content': json_data['message'],
                        'loan_data': loan_data if loan_data else None
                    }
                    logger.info(f"Response data: {response_data}")
                    yield f"data: {json.dumps(response_data)}\n\n"
                    buffer = ""  # Clear buffer after successful parse
            except json.JSONDecodeError:
                # If not valid JSON yet, continue buffering
                continue
            
            await asyncio.sleep(0.01)  # Small delay to prevent overwhelming the client
    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    try:
        logger.info(f"Received streaming request: {request}")
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
        else:
            agent = chat_agent

        if agent_name == 'LoanAgent':
            response_stream = stream_json_response(messages, agent)
        elif agent_name == 'InsightAgent':
            response_stream = stream_image_response(messages, agent)
        else:
            response_stream = stream_response(messages, agent)

        switch_tab = None
        if agent_name == 'FinancialAgent'or agent_name == 'BudgetAgent':
            switch_tab = 'Dashboard'
        elif agent_name == 'LoanAgent':
            switch_tab = 'Loan'
        elif agent_name == 'DocumentAgent':
            switch_tab = 'Document'
        elif agent_name == 'ProfileAgent':
            switch_tab = 'Profile'
        elif agent_name == 'InsightAgent':
            switch_tab = 'Insight'

        # Set up headers
        headers = {
            "Access-Control-Expose-Headers": "X-Switch-Tab",
            "Access-Control-Allow-Headers": "X-Switch-Tab"
        }
        if switch_tab:
            headers["X-Switch-Tab"] = switch_tab
            
        return StreamingResponse(
            response_stream,
            media_type="text/event-stream",
            headers=headers
        )

    except Exception as e:
        logger.error(f"Error in processing streaming response: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Keep the original endpoint for backward compatibility
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
        if agent_name == 'FinancialAgent'or agent_name == 'BudgetAgent':
            switch_tab = 'Dashboard'
        elif agent_name == 'LoanAgent':
            switch_tab = 'Loan'
        elif agent_name == 'DocumentAgent':
            switch_tab = 'Document'
        elif agent_name == 'ProfileAgent':
            switch_tab = 'Profile'

        return {"response": llm_response, "switch_tab": switch_tab}

    except Exception as e:
        logger.error(f"Error in processing response in chatbot: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
