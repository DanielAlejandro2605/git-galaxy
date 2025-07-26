import os
import requests
import base64
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import openai
import json

# Load environment variables
load_dotenv()

# GitHub API configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Accept": "application/vnd.github.mercy-preview+json",  # necessary for topics
    "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
}

# OpenAI configuration - use the same variable name as in the original code
OPENAI_API_KEY = os.getenv("OPENAI_API_TOKEN")  # Changed from OPENAI_API_KEY to OPENAI_API_TOKEN


class RepositorySearch:
    """Repository search functionality for finding similar repositories on GitHub"""
    
    def __init__(self):
        self.github_token = GITHUB_TOKEN
        self.openai_api_key = OPENAI_API_KEY
    
    def get_repo_readme(self, full_name: str) -> Optional[str]:
        """Get README content for a repository"""
        url = f"https://api.github.com/repos/{full_name}/readme"
        response = requests.get(url, headers=HEADERS)

        if response.status_code == 200:
            data = response.json()
            if data.get("encoding") == "base64":
                content = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
                return content
        return None

    def get_repo_info(self, full_name: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a repository"""
        url = f"https://api.github.com/repos/{full_name}"
        response = requests.get(url, headers=HEADERS)
        
        if response.status_code != 200:
            print(f"Error while retrieving repo {full_name}: {response.status_code}")
            return None

        data = response.json()
        langs_resp = requests.get(data["languages_url"], headers=HEADERS)
        languages = list(langs_resp.json().keys()) if langs_resp.status_code == 200 else []

        return {
            "name": data["full_name"],
            "description": data["description"] or "",
            "topics": data.get("topics", []),
            "languages": languages,
            "stars": data.get("stargazers_count", 0),
            "url": data.get("html_url", ""),
            "fork": data.get("fork", False),
            "archived": data.get("archived", False),
        }

    def generate_infos_with_openai(self, user_prompt: str) -> Dict[str, Any]:
        """Extract name keyword and topics from user prompt using OpenAI"""
        if not self.openai_api_key:
            print("Warning: OPENAI_API_TOKEN not set")
            return {"name_keyword": "", "topics": []}

        try:
            openai.api_key = self.openai_api_key
            
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
                messages=[{"role": "user", "content": prompt}],
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
            result = json.loads(arguments)
            
            # Validate that we got valid topics
            if not result.get("topics") or len(result["topics"]) == 0:
                print("Warning: OpenAI returned empty topics")
                return {"name_keyword": "", "topics": []}
                
            return result
            
        except Exception as e:
            print(f"Error extracting metadata from OpenAI: {e}")
            return {"name_keyword": "", "topics": []}

    def build_query(self, topics: List[str], in_name: str = "") -> str:
        """Build GitHub search query from topics and name keywords"""
        topic_query = " OR ".join([f"(topic:{t})" for t in topics])
        name_query = (" " + in_name + " in:name") if in_name != "" else ""
        return f"{topic_query}{name_query}"

    def search_repos(self, in_name: str, topics: List[str], max_results: int = 100) -> List[Dict[str, Any]]:
        """Search for repositories based on criteria"""
        query = self.build_query(topics, in_name)
        print(f"Search query: {query}")
        results = []

        per_page = 100
        total_pages = max_results // per_page + (1 if max_results % per_page > 0 else 0)

        for page in range(1, total_pages + 1):
            url = (
                f"https://api.github.com/search/repositories"
                f"?q={query}&sort=stars&order=desc"
                f"&per_page={per_page}&page={page}"
            )
            response = requests.get(url, headers=HEADERS)
            
            if response.status_code != 200:
                print(f"GitHub API Error: {response.status_code} - {response.json()}")
                break

            items = response.json().get("items", [])
            for repo in items:
                results.append({
                    "name": repo["full_name"],
                    "url": repo["html_url"],
                    "description": repo["description"],
                    "stars": repo["stargazers_count"],
                    "topics": repo.get("topics", []),
                })
                
                if len(results) >= max_results:
                    return results

            # Break early if GitHub returns fewer items than requested
            if len(items) < per_page:
                break

        return results

    def sort_by_similar_topics(self, repos: List[Dict[str, Any]], topics: List[str]) -> List[Dict[str, Any]]:
        """Sort repositories by similarity to given topics"""
        full_topics_list = set(topic.lower() for topic in topics)
        
        for repo in repos:
            repo_topics = set(topic.lower() for topic in repo['topics'])
            repo['common_topics'] = repo_topics & full_topics_list
            repo['topics_ratio'] = len(repo['common_topics']) / (len(full_topics_list) + len(repo_topics))

        return sorted(repos, key=lambda repo: repo['topics_ratio'], reverse=True)

    def search_by_prompt(self, user_prompt: str, max_results: int = 500, limit_results: int = 10) -> Dict[str, Any]:
        """Search repositories based on user prompt using AI extraction"""
        try:
            print(f"Processing prompt: {user_prompt}")
            
            # Extract metadata from user prompt using OpenAI
            infos = self.generate_infos_with_openai(user_prompt)
            in_name, topics = infos['name_keyword'], infos['topics']

            print(f"Extracted info: name_keyword='{in_name}', topics={topics}")

            if not topics:
                return {
                    "error": "Could not extract topics from prompt. Please check your OPENAI_API_TOKEN environment variable and try again.",
                    "repositories": [],
                    "extracted_info": infos
                }

            # Search for repositories
            repos = self.search_repos(in_name, topics, max_results)
            
            # Sort by similarity
            repos = self.sort_by_similar_topics(repos, topics)
            
            # Limit results
            repos = repos[:limit_results]

            # Add README content for each repository
            for repo in repos:
                repo['readme'] = self.get_repo_readme(repo['name'])

            return {
                "user_prompt": user_prompt,
                "extracted_info": infos,
                "repositories": repos,
                "total_found": len(repos),
                "search_criteria": {
                    "name_keyword": in_name,
                    "topics": topics
                }
            }
            
        except Exception as e:
            print(f"Error in search_by_prompt: {e}")
            return {
                "error": f"Failed to search repositories: {str(e)}",
                "repositories": []
            }

    def score_similarity(self, source: Dict[str, Any], candidate: Dict[str, Any]) -> int:
        """Calculate similarity score between two repositories"""
        score = 0

        # Common topics
        source_topics = set(source["topics"])
        candidate_topics = set(candidate.get("topics", []))
        score += len(source_topics & candidate_topics)

        # Common languages
        langs_url = candidate.get("languages_url")
        candidate_languages = []
        if langs_url:
            langs_resp = requests.get(langs_url, headers=HEADERS)
            if langs_resp.status_code == 200:
                candidate_languages = list(langs_resp.json().keys())
        score += len(set(source["languages"]) & set(candidate_languages))

        # Similarity in description
        source_words = set(source["description"].lower().split())
        candidate_words = set((candidate.get("description") or "").lower().split())
        score += len(source_words & candidate_words) // 5  # weak weight

        return score

    def extract_metadata_from_description(self, description: str) -> Dict[str, Any]:
        """Extract metadata from project description using OpenAI"""
        if not self.openai_api_key:
            return {"name_keyword": "", "topics": []}

        try:
            openai.api_key = self.openai_api_key
            
            prompt = f"""
            You are an assistant that extracts useful metadata from GitHub project descriptions.

            From a project description, return a JSON object with:
            - "name_keyword": a single word, relevant and representative of the project name, to use with in:name
            - "topics": a list of 3 to 5 keywords (GitHub topics) describing the project

            Respond only with valid JSON. Do not add any text or explanation.

            Description:
            {description}
            """

            response = openai.ChatCompletion.create(
                model="gpt-4-0613",
                messages=[{"role": "user", "content": prompt}],
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

            # Extract arguments provided to the function call
            arguments = response["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"]
            return json.loads(arguments)
            
        except Exception as e:
            print(f"Error extracting metadata: {e}")
            return {"name_keyword": "", "topics": []}

    def find_similar_repositories(self, repository_name: str, max_results: int = 50) -> Dict[str, Any]:
        """Find similar repositories based on a given repository"""
        # Get source repository info
        source_repo = self.get_repo_info(repository_name)
        if not source_repo:
            return {
                "error": f"Could not retrieve information for repository: {repository_name}",
                "repositories": []
            }

        # Build search query
        query = self.build_query(source_repo["topics"], "")
        
        # Search for candidates
        candidates = self.search_repos("", source_repo["topics"], max_results)

        # Calculate similarity scores
        scored = []
        for repo in candidates:
            score = self.score_similarity(source_repo, repo)
            if repo["name"].lower() != source_repo["name"].lower():  # avoid the original
                scored.append({**repo, "similarity_score": score})

        # Sort by similarity score
        scored.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_matches = scored[:10]

        return {
            "source_repository": source_repo,
            "repositories": top_matches,
            "total_found": len(scored)
        }

