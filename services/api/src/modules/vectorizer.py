import numpy as np
import hashlib
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from sentence_transformers import SentenceTransformer
import json

@dataclass
class CodeVector:
    chunk_id: str
    file_path: str
    content: str
    semantic_vector: np.ndarray
    metadata: Dict[str, Any]
    chunk_type: str

class SimpleRepositoryVectorizer:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize with sentence transformer model"""
        self.sentence_model = SentenceTransformer(model_name)
        self.vectors: List[CodeVector] = []

    def vectorize_repository(self, repo_text: str) -> List[CodeVector]:
        """Convert repository text into searchable vectors"""
        # Parse gitingest output into files
        files = self._parse_gitingest_output(repo_text)
        
        vectors = []
        for file_info in files:
            file_path = file_info['path']
            content = file_info['content']
            
            # Create semantic embedding
            semantic_vector = self.sentence_model.encode(content)
            
            # Create vector
            vector = CodeVector(
                chunk_id=self._generate_chunk_id(file_path),
                file_path=file_path,
                content=content,
                semantic_vector=semantic_vector,
                metadata={'language': self._detect_language(file_path)},
                chunk_type='file'
            )
            vectors.append(vector)
        
        self.vectors = vectors
        return vectors

    def find_similar_chunks(self, query: str, top_k: int = 5) -> List[Tuple[CodeVector, float]]:
        """Find similar code chunks using semantic similarity"""
        if not self.vectors:
            return []
        
        # Encode query
        query_vector = self.sentence_model.encode([query])
        
        similarities = []
        for vector in self.vectors:
            # Calculate cosine similarity
            similarity = np.dot(query_vector[0], vector.semantic_vector) / (
                np.linalg.norm(query_vector[0]) * np.linalg.norm(vector.semantic_vector)
            )
            similarities.append((vector, float(similarity)))
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def generate_llm_context(self, query: str, max_context_length: int = 4000) -> str:
        """Generate context for LLM by finding relevant code chunks"""
        similar_chunks = self.find_similar_chunks(query, top_k=10)
        
        context_parts = []
        current_length = 0
        
        for vector, similarity in similar_chunks:
            chunk_context = f"""
## {vector.file_path}
Similarity: {similarity:.3f}
```
{vector.content}
```
"""
            
            if current_length + len(chunk_context) > max_context_length:
                break
            
            context_parts.append(chunk_context)
            current_length += len(chunk_context)
        
        return "\n".join(context_parts)

    def _parse_gitingest_output(self, repo_text: str) -> List[Dict[str, str]]:
        """Parse gitingest output into files"""
        files = []
        current_file = None
        current_content = []
        
        for line in repo_text.split('\n'):
            if line.startswith('## ') or line.startswith('File: '):
                if current_file:
                    files.append({
                        'path': current_file,
                        'content': '\n'.join(current_content)
                    })
                current_file = line.replace('## ', '').replace('File: ', '').strip()
                current_content = []
            else:
                current_content.append(line)
        
        if current_file:
            files.append({
                'path': current_file,
                'content': '\n'.join(current_content)
            })
        
        return files

    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        extension_map = {
            '.py': 'python', '.js': 'javascript', '.jsx': 'javascript',
            '.ts': 'typescript', '.tsx': 'typescript', '.java': 'java',
            '.cpp': 'cpp', '.c': 'c', '.h': 'c', '.cs': 'csharp',
            '.rb': 'ruby', '.go': 'go', '.rs': 'rust', '.php': 'php'
        }
        
        for ext, lang in extension_map.items():
            if file_path.endswith(ext):
                return lang
        return 'unknown'

    def _generate_chunk_id(self, file_path: str) -> str:
        """Generate unique ID for chunk"""
        return hashlib.md5(file_path.encode()).hexdigest()[:16]

# Integration class for your API
class GitGalaxyVectorizer:
    def __init__(self):
        self.vectorizer = SimpleRepositoryVectorizer()
    
    def process_repository(self, repo_text: str) -> Dict[str, Any]:
        """Process repository and return vectorization results"""
        vectors = self.vectorizer.vectorize_repository(repo_text)
        
        return {
            'total_files': len(vectors),
            'ready_for_llm': True
        }
    
    def query_repository(self, query: str, repo_text: str = None) -> Dict[str, Any]:
        """Query the vectorized repository"""
        if repo_text:
            self.vectorizer.vectorize_repository(repo_text)
        
        # Find similar chunks
        similar_chunks = self.vectorizer.find_similar_chunks(query)
        
        # Generate LLM context
        llm_context = self.vectorizer.generate_llm_context(query)
        
        return {
            'query': query,
            'similar_chunks': [
                {
                    'file_path': vector.file_path,
                    'similarity': float(score),
                    'content_preview': vector.content[:200] + '...' if len(vector.content) > 200 else vector.content
                }
                for vector, score in similar_chunks
            ],
            'llm_context': llm_context,
            'ready_for_llm': True
        } 