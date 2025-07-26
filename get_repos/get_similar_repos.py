import os
import requests
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {
    "Accept": "application/vnd.github.mercy-preview+json",
    "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else None,
}


def get_repo_info(full_name):
    
    url = f"https://api.github.com/repos/{full_name}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        print(f"❌ Impossible de récupérer les infos de {full_name} :", response.status_code)
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
    query_parts = [f"topic:{t}" for t in topics] + [f"language:{l}" for l in languages]
    return " ".join(query_parts)


def search_repos(query, max_results=50):
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page={min(max_results, 100)}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        print("❌ Erreur API:", response.status_code, response.json())
        return []

    return response.json().get("items", [])


def score_similarity(source, candidate):
    score = 0

    # Topics en commun
    source_topics = set(source["topics"])
    candidate_topics = set(candidate.get("topics", []))
    score += len(source_topics & candidate_topics)

    # Langages en commun
    langs_url = candidate.get("languages_url")
    candidate_languages = []
    if langs_url:
        langs_resp = requests.get(langs_url, headers=HEADERS)
        if langs_resp.status_code == 200:
            candidate_languages = list(langs_resp.json().keys())
    score += len(set(source["languages"]) & set(candidate_languages))

    # Similarité dans la description
    source_words = set(source["description"].lower().split())
    candidate_words = set((candidate.get("description") or "").lower().split())
    score += len(source_words & candidate_words) // 5  # poids faible

    return score


if __name__ == "__main__":
    input_repo = "andreasnicolaou/typescript-expression-language"

    print(f"🔍 Analyse du repo : {input_repo}")
    source_repo = get_repo_info(input_repo)

    if not source_repo:
        exit()

    print(f"\n📄 Description : {source_repo['description']}")
    print(f"🏷️ Topics : {', '.join(source_repo['topics'])}")
    print(f"🌐 Langages : {', '.join(source_repo['languages'])}")

    print("\n🔎 Recherche de projets similaires...\n")

    # Étape 1 : rechercher des repos bruts
    query = build_query(source_repo["topics"], source_repo["languages"])
    candidates = search_repos(query, max_results=50)

    # Étape 2 : calculer un score de similarité pour chaque repo
    scored = []
    for repo in candidates:
        score = score_similarity(source_repo, repo)
        if repo["full_name"].lower() != source_repo["name"].lower():  # éviter l'original
            scored.append((repo, score))

    # Étape 3 : trier et afficher les top 10
    scored.sort(key=lambda x: x[1], reverse=True)
    top_matches = scored[:10]

    for i, (repo, score) in enumerate(top_matches, 1):
        print(f"{i}. {repo['full_name']} ⭐ {repo['stargazers_count']} [score: {score}]")
        print(f"   🔗 {repo['html_url']}")
        print(f"   📝 {repo['description']}")
        print("----")

    print("\n🎉 Fin de la recherche !")