import os
from tqdm import tqdm
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


def search_repos(topics, languages, max_results):
    query = build_query(topics, languages)
    results = []

    per_page = 100
    total_pages = (max_results + per_page - 1) // per_page  # ceiling division

    for page in tqdm(range(1, total_pages + 1)):
        url = (
            f"https://api.github.com/search/repositories"
            f"?q={query}&sort=stars&order=desc"
            f"&per_page={per_page}&page={page}"
        )
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print("Error:", response.status_code, response.json())
            break

        items = response.json().get("items", [])
        for repo in items:
            results.append({
                "name": repo["full_name"],
                "url": repo["html_url"],
                "description": repo["description"],
                "stars": repo["stargazers_count"],
                "topics": repo.get("topics", []),
                "languages": repo.get("languages", []),
            })
            if len(results) >= max_results:
                return results

        # Break early if GitHub returns fewer items than requested
        if len(items) < per_page:
            break

    return results


if __name__ == "__main__":
    topics = ["web3", "blockchain"]
    languages = ["Solidity", "TypeScript"]
    max_results = 1000

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
