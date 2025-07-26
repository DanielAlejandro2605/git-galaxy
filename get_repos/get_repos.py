import os
import sys
import base64
from tqdm import tqdm
import requests
from dotenv import load_dotenv
from query_openai import generate_infos_with_openai
sys.stdout.reconfigure(encoding='utf-8')


load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Accept": "application/vnd.github.mercy-preview+json",  # nécessaire pour les topics
    "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
}


def get_repo_readme(full_name):
    url = f"https://api.github.com/repos/{full_name}/readme"
    response = requests.get(url, headers=HEADERS)

    if response.status_code == 200:
        data = response.json()
        if data.get("encoding") == "base64":
            content = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
            return content
    return None


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


def build_query(topics, in_name):
    topic_query = " OR ".join([f"(topic:{t})" for t in topics])
    name_query = (" " + in_name + " in:name") if in_name != "" else ""
    return f"{topic_query}{name_query}"


def search_repos(in_name, topics, max_results):
    query = build_query(topics, in_name)
    print(query, file=sys.stderr)
    results = []

    per_page = 100
    total_pages = max_results // per_page + max_results % per_page
    print(total_pages, file=sys.stderr)

    for page in tqdm(range(1, total_pages + 1)):
        url = (
            f"https://api.github.com/search/repositories"
            f"?q={query}&sort=stars&order=desc"
            # f"?q={query}"
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
            })
            if len(results) >= max_results:
                return results

        # Break early if GitHub returns fewer items than requested
        if len(items) < per_page:
            break

    return results


def sort_by_similar_topics(repos, topics):
    full_topics_list = set(topic.lower() for topic in topics)
    for repo in repos:
        repo_topics = set(topic.lower() for topic in repo['topics'])
        repo['common_topics'] = repo_topics & full_topics_list
        repo['topics_ratio'] = len(repo['common_topics']) / (len(full_topics_list) + len(repo_topics))

    return sorted(repos, key=lambda repo: repo['topics_ratio'], reverse=True)


if __name__ == "__main__":
    max_results = 500
    user_prompt = input("prompt:")
    infos = generate_infos_with_openai(user_prompt)
    in_name, topics = infos['name_keyword'], infos['topics']
    # in_name = "medical"
    # topics = ["computer-vision"]

    print(in_name, topics, file=sys.stderr)
    repos = search_repos(in_name, topics, max_results)
    repos = sort_by_similar_topics(repos, topics)
    # limit to first 10:
    repos = repos[:10]

    for i, repo in enumerate(repos, 1):
        print(f"{i}. {repo['name']} ; stars: {repo['stars']}")
        print(f"  url: {repo['url']}")
        print(f"  description: {repo['description']}")
        if repo['topics']:
            print(f"  topics: {', '.join(repo['topics'])}")
        print(f"  commont topics: {', '.join(repo['common_topics'])}")
        print(f"  topics ratio: {repo['topics_ratio']}")
        print("----")
        # print("README.md:")
        # print(get_repo_readme(repo['name']))
        print("==========================================")
        repo['readme'] = get_repo_readme(repo['name'])
