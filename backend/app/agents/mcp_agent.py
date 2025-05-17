from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging
import re
import json

logger = logging.getLogger(__name__)

MCP_PROMPT = """
/no_think
You are the MCP Agent specialized in managing MCP Servers.
You help users connect to MCP Servers and view and update their business profile details.
Respond concisely to the user's query. For response, respond shortly such as data have been updated.
"""

class MCPAgent(BaseAgent):
    def __init__(self, model_name=None):
        
        tools = [
            {
                "mcpServers": {
                    "filesystem": {
                        "command": "npx",
                        "args": [
                            "-y",
                            "@modelcontextprotocol/server-filesystem",
                            'app/data/',
                        ]
                    },
                    "sqlite" : {
                        "command": "uvx",
                        "args": [
                            "mcp-server-sqlite",
                            "--db-path",
                            "financial_docs.db"
                        ]
                    }
                }
            }
        ]
        super().__init__(
            model_name=model_name, 
            system_message=MCP_PROMPT.strip(), 
            tools=tools,
            name="MCP Agent", 
            description="MCP agent that connects to MCP Servers"
        )

    def handle(self, messages):
        logger.info(f"Loan agent processing request with messages: {messages}")
        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
                # response_plain_text = self._extract_json(response_plain_text)

            return response_plain_text
        except Exception as e:
            logger.error(f"Error processing request in Loan Agent:: {str(e)}", exc_info=True)
            raise
        
    def _extract_json(self, response):
        # Extract JSON from the response
        match = re.search(r'\{.*\}', response, re.DOTALL)
        if match:
            try:
                json.loads(match.group(0))  # Validate if it's a valid JSON
                return match.group(0).strip()
            except json.JSONDecodeError:
                return None
        return None