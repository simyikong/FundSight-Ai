from .base_agent import BaseAgent
from qwen_agent.utils.output_beautify import typewriter_print
import logging
import os
import json

logger = logging.getLogger(__name__)

FUNDING_PROMPT = """
/no_think
You are a funding recommendation agent that helps Malaysian MSMEs find suitable funding schemes.

I will provide you with company information and funding request details. Your task is to:
1. Analyze the company profile and financial data
2. Review the available funding schemes in the "latest funding_schemes.csv" file
3. Recommend the most suitable funding options

For financial information including revenue data, please analyze the "Monthly_Financial_Data_2025.csv" file carefully.

Please return exactly 3 funding recommendations formatted as a JSON array of objects. Each recommendation object should have:
- id: A number (1, 2, or 3)
- name: The funding scheme name
- provider: The institution providing the funding
- amount: The funding amount range
- interestRate: Interest rate or "0% (Grant)" for grants
- eligibilitySummary: Short summary of eligibility requirements
- applicationUrl: The website URL for the funding scheme
- objective: The funding scheme's objective
- coverage: What the funding covers
- eligibilityRequirements: An array of strings listing eligibility criteria
- financingAmount: An array of strings describing financing amounts
- tenure: The financing tenure
- financingRate: An array of strings describing financing rates
- reasons: An array of 3 strings explaining why this scheme is recommended for the company

Make sure your recommendations match the company profile and funding purpose.
/no_think
"""

ROOT_RESOURCE = os.path.join(os.path.dirname(__file__), '..', 'data')

class FundingRecommendationAgent(BaseAgent):
    def __init__(self, model_name=None):
        super().__init__(
            model_name="qwen-max",
            system_message=FUNDING_PROMPT.strip(),
            name="Funding Recommendation Agent",
            description="Generate funding recommendations"
        )

    def handle(self, messages, company_data=None, financial_data=None):
        logger.info(f"Funding recommendation agent processing request with messages: {messages}")
        
        # Add funding schemes CSV to the context
        messages.append({
            "role": "user", 
            "content": [
                {'text': 'Please analyze this funding schemes data to make recommendations:'},
                {'file': os.path.join(ROOT_RESOURCE, 'latest funding_schemes.csv')}
            ]
        })
        
        # Add financial data if available
        if financial_data:
            messages.append({
                "role": "user", 
                "content": [
                    {'text': 'Here is the company\'s financial data including revenue information:'},
                    {'file': os.path.join(ROOT_RESOURCE, 'Monthly_Financial_Data_2025.csv')}
                ]
            })
        
        # Add company profile data if available
        if company_data:
            company_info = f"""
            Company Profile:
            Name: {company_data.get('name', 'N/A')}
            Industry: {company_data.get('industry', 'N/A')}
            Years in operation: {company_data.get('years_in_operation', 'N/A')}
            Number of employees: {company_data.get('num_employees', 'N/A')}
            Bumiputera status: {company_data.get('is_bumiputera', 'No')}
            """
            messages.append({
                "role": "user",
                "content": company_info
            })

        try:
            response_plain_text = ''
            for response in self.agent.run(messages=messages):
                response_plain_text = typewriter_print(response, response_plain_text)
            
            # Try to extract and parse JSON response
            try:
                # Find JSON array in response
                start_idx = response_plain_text.find('[')
                end_idx = response_plain_text.rfind(']') + 1
                
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response_plain_text[start_idx:end_idx]
                    recommendations = json.loads(json_str)
                    return recommendations
                else:
                    logger.error("Could not find JSON array in response")
                    return []
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                return []
                
        except Exception as e:
            logger.error(f"Error in funding recommendation agent: {e}")
            raise
