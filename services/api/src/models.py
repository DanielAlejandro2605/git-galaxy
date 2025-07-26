from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class RepositoryType(str, Enum):
    AI = "ai"
    WEB3 = "web3"
    TOOLS = "tools"
    LIBRARY = "library"
    FRAMEWORK = "framework"
    APPLICATION = "application"
    PLUGIN = "plugin"
    TEMPLATE = "template"
    DOCUMENTATION = "documentation"
    OTHER = "other"

class RelationshipType(str, Enum):
    DEPENDS_ON = "depends_on"
    SIMILAR_TECH = "similar_tech"
    SIMILAR_PURPOSE = "similar_purpose"
    ALTERNATIVE_TO = "alternative_to"
    FORKED_FROM = "forked_from"
    ECOSYSTEM = "ecosystem"
    INSPIRED_BY = "inspired_by"
    EXTENDS = "extends"
    COMPETES_WITH = "competes_with"

class Repository(BaseModel):
    id: str
    name: str
    type: RepositoryType
    stars: int
    language: str
    owner: str
    url: str
    description: Optional[str] = None
    topics: List[str] = []
    created_at: str
    last_updated: str
    # Enhanced metadata
    framework_stack: List[str] = []
    dependencies: List[str] = []
    purpose_category: str = ""
    community_score: float = 0.0
    # Additional fields
    forks: int = 0
    watchers: int = 0
    open_issues: int = 0
    license: Optional[str] = None
    size: int = 0
    default_branch: str = "main"
    homepage: Optional[str] = None
    language_percentage: Dict[str, float] = {}
    contributors_count: int = 0
    last_commit_date: Optional[str] = None

class RepositoryLink(BaseModel):
    source: str
    target: str
    type: RelationshipType
    strength: float  # 0.0 to 1.0
    explanation: str
    metadata: Dict[str, Any] = {}

class ProjectSearchRequest(BaseModel):
    project_description: str  # Natural language description
    max_results: int = 20
    include_relationships: bool = True
    filter_by_language: Optional[str] = None
    filter_by_stars: Optional[int] = None

class SearchCriteria(BaseModel):
    technologies: List[str] = []
    project_type: Optional[str] = None
    domain: Optional[str] = None
    features: List[str] = []
    complexity: Optional[str] = None
    keywords: List[str] = []

class SearchInsights(BaseModel):
    total_matches: int
    top_technologies: List[str]
    top_categories: List[str]
    difficulty_distribution: Dict[str, int]

class ConstellationResponse(BaseModel):
    search_query: str
    matched_repositories: List[Repository]
    nodes: List[Repository]
    links: List[RepositoryLink]
    insights: SearchInsights
    processing_time: float
    metadata: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    message: str
    version: str
    services: Dict[str, str] 