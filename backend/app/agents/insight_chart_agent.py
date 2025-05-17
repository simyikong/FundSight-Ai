from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging
import os

logger = logging.getLogger(__name__)

# INSIGHT_PROMPT = """
# /no_think
# You are an insight agent that helps Malaysian MSMEs to understand their financial performance.
# Always refer to the Monthly financial data 2025.csv file to answer user questions.
# Always pd.head the file first and use the code interpreter to draw charts. Always save the plot image by running plt.savefig('chart.png', dpi=300). No need show the plot.
# Only output the message: The line chart XXX has been generated successfully.

# Your capabilities include:
# 1. Generate executive summary report with charts and AI-generated insights to help companies understand their financial performance.
# 2. Answer to user questions about the report concisely.
# 3. Provide insights and recommendations to help companies improve their financial performance.
# /no_think
# """

INSIGHT_PROMPT = """
/no_think
You are an insight agent that helps Malaysian MSMEs to understand their financial performance.
Always refer to the Monthly financial data 2025.csv file to answer user questions.
Always pd.head the file first and use the tools to draw charts. Show me the saved path.
/no_think
"""

ROOT_RESOURCE = os.path.join(os.path.dirname(__file__), '..', 'data')

class InsightAgent(BaseAgent):
    def __init__(self, model_name=None):
        tools = [
            {
                "mcpServers": {
                    "mcp-server-chart": {
                    "command": "npx",
                    "args": [
                        "-y",
                        "@antv/mcp-server-chart"
                    ]
                    }
                }
            }
        ]
        super().__init__(
            model_name="qwen-max",
            system_message=INSIGHT_PROMPT.strip(),
            name="Insight Agent",
            tools = [tools],
            description="Generate insights"
        )

    def handle(self, messages):
        logger.info(f"Insight agent processing request with messages: {messages}")
        # messages.append({"role": "user", "content": [{'text':'Generate me a line chart of the cash inflow and outflow from july to october 2025'},{'file': os.path.join(ROOT_RESOURCE, 'Monthly_Financial_Data_2025.csv')}]})
        messages.append({"role": "user", "content": [{'file': os.path.join(ROOT_RESOURCE, 'Monthly_Financial_Data_2025.csv')}]})

        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            return response_plain_text
        except Exception as e:
            raise