import openai
from dotenv import load_dotenv
import os
import json

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_TOKEN")

def generate_infos_with_openai(user_prompt):
    prompt = f"""
    You are an assistant that extracts useful metadata from GitHub project descriptions.

    From a project description, return a JSON object with:
    - "name_keyword": a single, relevant and representative word from the project name, to be used with in:name
    - "topics": a list of 1 to 3 GitHub topic keywords describing the project

    Respond only with valid JSON. Do not add any text or explanation.

    Description :
    {user_prompt}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4-0613",
        messages=[
            {"role": "user", "content": prompt}
        ],
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "github_search_assistant",
                    "description": "Extract relevant name keyword and topics from GitHub project description.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "name_keyword": {
                                "type": "string",
                                "description": "A single keyword to be used in a GitHub 'in:name' search query."
                            },
                            "topics": {
                                "type": "array",
                                "items": {"type": "string"},
                                "minItems": 1,
                                "maxItems": 3,
                                "description": "A list of 1 to 3 relevant GitHub topics for this project."
                            }
                        },
                        "required": ["name_keyword", "topics"],
                        "additionalProperties": False
                    }
                }
            }
        ],
        tool_choice={"type": "function", "function": {"name": "github_search_assistant"}},
        temperature=0.3,
    )

    arguments = response["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"]
    parsed = json.loads(arguments)
    return parsed
