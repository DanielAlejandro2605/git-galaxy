import os
import requests
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Accept": "application/vnd.github.mercy-preview+json",  # nécessaire pour les topics
    "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
}


def build_query(topics, languages):
    topic_query = " OR ".join([f"(topic:{t})" for t in topics])
    lang_query = " OR ".join([f"(language:{l})" for l in languages])
    return f"{topic_query} {lang_query}"


def search_repos(topics, languages, max_results=10):
    query = build_query(topics, languages)
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page={min(max_results, 100)}"

    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        print("Erreur API:", response.status_code, response.json())
        return []

    items = response.json().get("items", [])
    results = []
    for repo in items:
        results.append({
            "name": repo["full_name"],
            "url": repo["html_url"],
            "description": repo["description"],
            "stars": repo["stargazers_count"],
            "topics": repo.get("topics", []),
            "languages": repo.get("languages", []),
        })
    return results


if __name__ == "__main__":
    topics = ["web3", "blockchain", "nft"]
    languages = ["Solidity", "TypeScript"]
    max_results = 20

    repos = search_repos(topics, languages, max_results)

    for i, repo in enumerate(repos, 1):
        print(f"{i}. {repo['name']} ⭐ {repo['stars']}")
        print(f"   🔗 {repo['url']}")
        print(f"   📝 {repo['description']}")
        if repo['topics']:
            print(f"   🏷️  {', '.join(repo['topics'])}")
        if repo['languages']:
            print(f"   🌐  {', '.join(repo['languages'])}")
        print("----")
