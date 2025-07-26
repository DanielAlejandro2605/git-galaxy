import openai
from dotenv import load_dotenv
import os
import json

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_TOKEN")

description = "un solveur de rubik's cube en rust avec une interface graphique"

prompt = f"""
Tu es un assistant qui extrait des métadonnées utiles à partir de descriptions de projets GitHub.

À partir d'une description de projet, retourne un objet JSON avec :
- "name_keyword" : un seul mot, pertinent et représentatif du nom du projet, à utiliser avec in:name
- "topics" : une liste de 3 à 5 mots-clés (topics GitHub) décrivant le projet

Répond uniquement avec un JSON valide. N'ajoute aucun texte ou explication.

Description :
{description}
"""

response = openai.ChatCompletion.create(
    model="gpt-4-0613",  # ou gpt-4o une fois que l'API supporte tools
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
                            "minItems": 3,
                            "maxItems": 5,
                            "description": "A list of 3 to 5 relevant GitHub topics for this project."
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

# Extraire les arguments fournis à l'appel de la fonction
arguments = response["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"]
parsed = json.loads(arguments)

print(json.dumps(parsed, indent=2, ensure_ascii=False))
