import os
import sys
from tqdm import tqdm
import requests
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Accept": "application/vnd.github.mercy-preview+json",  # nécessaire pour les topics
    "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
}


def get_repo_info(full_name):
    url = f"https://api.github.com/repos/{full_name}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        print(f"Error while retreiving repo {full_name} :", response.status_code)
        return None

    data = response.json()
    langs_resp = requests.get(data["languages_url"], headers=HEADERS)
    languages = list(langs_resp.json().keys()) if langs_resp.status_code == 200 else []

    return {
        "name": data["full_name"],
        "description": data["description"] or "",
        "topics": data.get("topics", []),
        "languages": languages,
    }


def build_query(topics, languages):
    topic_query = " ".join([f"topic:{t}" for t in topics])
    lang_query = " ".join([f"language:{l}" for l in languages])
    return f"{topic_query} {lang_query}"


def search_repos(topics, languages, max_results):
    query = build_query(topics, languages)
    results = []

    per_page = 100
    total_pages = (max_results + per_page - 1) // per_page  # ceiling division

    for page in tqdm(range(1, total_pages + 1)):
        url = (
            f"https://api.github.com/search/repositories"
            # f"?q={query}&sort=stars&order=desc"
            f"?q={query}"
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
                print("########### THE END (RESULTS) ###########")
                return results

        # Break early if GitHub returns fewer items than requested
        if len(items) < per_page:
            print("########### THE END ###########")
            break

    return results


def sort_by_similar_topics(repos, topics, languages):
    full_topics_list = set(topic.lower() for topic in topics + languages)
    for repo in repos:
        repo_topics = set(topic.lower() for topic in repo['topics'])
        repo['common_topics'] = repo_topics & full_topics_list

    return sorted(repos, key=lambda repo: len(repo['common_topics']), reverse=True)


if __name__ == "__main__":
    max_results = 1000
    repo_name = "JeanJano/rubik"
    # repo_name = ""
    if repo_name:
        repo = get_repo_info(repo_name)
        topics = repo['topics']
        languages = repo['languages']
    else:
        topics = ["web3", "blockchain"]
        languages = ["Solidity", "TypeScript"]

    print(topics, file=sys.stderr)
    print(languages, file=sys.stderr)
    repos = search_repos(topics, languages, max_results)
    repos = sort_by_similar_topics(repos, topics, languages)

    for i, repo in enumerate(repos, 1):
        print(f"{i}. {repo['name']} ⭐ {repo['stars']}")
        print(f"   🔗 {repo['url']}")
        print(f"   📝 {repo['description']}")
        if repo['topics']:
            print(f"   🏷️ {', '.join(repo['topics'])}")
        if repo['languages']:
            print(f"   🌐 {', '.join(repo['languages'])}")
        print(f"   🏷️ {', '.join(repo['common_topics'])}")
        print("----")
