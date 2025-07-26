#!/usr/bin/env python3
"""
Test script for RepositorySearchService integration
"""
import asyncio
import os
from dotenv import load_dotenv
from src.services.repository_search_service import RepositorySearchService
from src.models import SearchCriteria

# Load environment variables
load_dotenv()

async def test_repository_search():
    """Test the repository search functionality"""
    print("🧪 Testing RepositorySearchService...")
    
    # Initialize the service
    search_service = RepositorySearchService()
    
    # Test 1: Search by criteria
    print("\n1. Testing search by criteria...")
    criteria = SearchCriteria(
        technologies=["python", "machine-learning"],
        keywords=["ai", "neural-network"],
        filter_by_language="python"
    )
    
    try:
        repos = await search_service.search_repositories(criteria)
        print(f"✅ Found {len(repos)} repositories")
        
        if repos:
            print("Top 3 results:")
            for i, repo in enumerate(repos[:3], 1):
                print(f"  {i}. {repo.name} ⭐ {repo.stars}")
                print(f"     Type: {repo.type.value}")
                print(f"     Language: {repo.language}")
                print(f"     Topics: {', '.join(repo.topics[:5])}")
                print()
    except Exception as e:
        print(f"❌ Error in search by criteria: {e}")
    
    # Test 2: Search similar repositories
    print("\n2. Testing similar repository search...")
    try:
        similar_repos = await search_service.search_similar_repositories(
            "tensorflow/tensorflow", 
            max_results=5
        )
        print(f"✅ Found {len(similar_repos)} similar repositories")
        
        if similar_repos:
            print("Top similar repositories:")
            for i, repo in enumerate(similar_repos[:3], 1):
                print(f"  {i}. {repo.name} ⭐ {repo.stars}")
                print(f"     Type: {repo.type.value}")
                print(f"     Language: {repo.language}")
                print()
    except Exception as e:
        print(f"❌ Error in similar repository search: {e}")
    
    # Test 3: Get repository details
    print("\n3. Testing repository details fetch...")
    try:
        repo_details = await search_service.fetch_repository_details({
            "full_name": "microsoft/vscode"
        })
        print(f"✅ Fetched details for {repo_details.name}")
        print(f"   Stars: {repo_details.stars}")
        print(f"   Type: {repo_details.type.value}")
        print(f"   Language: {repo_details.language}")
        print(f"   Topics: {', '.join(repo_details.topics[:5])}")
        print(f"   Community Score: {repo_details.community_score:.2f}")
    except Exception as e:
        print(f"❌ Error in repository details fetch: {e}")
    
    # Test 4: Rank repositories by relevance
    print("\n4. Testing repository ranking...")
    try:
        if repos:
            ranked_repos = await search_service.rank_repositories_by_relevance(
                repos, 
                "machine learning neural network python"
            )
            print(f"✅ Ranked {len(ranked_repos)} repositories by relevance")
            
            if ranked_repos:
                print("Top ranked repositories:")
                for i, repo in enumerate(ranked_repos[:3], 1):
                    print(f"  {i}. {repo.name} ⭐ {repo.stars}")
                    print(f"     Type: {repo.type.value}")
                    print(f"     Language: {repo.language}")
                    print()
    except Exception as e:
        print(f"❌ Error in repository ranking: {e}")

async def test_github_search_service():
    """Test the GitHub search service directly"""
    print("\n🔍 Testing GitHubSearchService...")
    
    from src.services.github_search_service import GitHubSearchService
    
    github_service = GitHubSearchService()
    
    # Test trending repositories
    print("\n1. Testing trending repositories...")
    try:
        trending = await github_service.get_trending_repositories(language="python")
        print(f"✅ Found {len(trending)} trending Python repositories")
        
        if trending:
            print("Top trending repositories:")
            for i, repo in enumerate(trending[:3], 1):
                print(f"  {i}. {repo['full_name']} ⭐ {repo['stargazers_count']}")
    except Exception as e:
        print(f"❌ Error in trending repositories: {e}")
    
    # Test search by topics
    print("\n2. Testing search by topics...")
    try:
        topic_repos = await github_service.search_by_topics(["machine-learning", "python"])
        print(f"✅ Found {len(topic_repos)} repositories with machine-learning and python topics")
        
        if topic_repos:
            print("Top topic-based repositories:")
            for i, repo in enumerate(topic_repos[:3], 1):
                print(f"  {i}. {repo['full_name']} ⭐ {repo['stargazers_count']}")
    except Exception as e:
        print(f"❌ Error in topic search: {e}")

if __name__ == "__main__":
    print("🚀 Starting RepositorySearchService integration tests...")
    print(f"GitHub Token: {'✅ Set' if os.getenv('GITHUB_TOKEN') else '❌ Not set'}")
    
    # Run tests
    asyncio.run(test_repository_search())
    asyncio.run(test_github_search_service())
    
    print("\n�� Tests completed!") 