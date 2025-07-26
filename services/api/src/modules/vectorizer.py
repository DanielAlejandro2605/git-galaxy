import numpy as np
import hashlib
import re
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

class CodeRepositoryVectorizer:
    def __init__(self, model_name: str = "microsoft/codebert-base-mlm"):
        """Initialize with code-specific transformer model"""
        try:
            self.sentence_model = SentenceTransformer(model_name)
        except:
            # Fallback to a more general model if codebert is not available
            print("Warning: Using fallback model. For better code similarity, install codebert-base-mlm")
            self.sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
        
        self.vectors: List[CodeVector] = []

    def vectorize_repository(self, repo_text: str) -> List[CodeVector]:
        """Convert repository text into searchable vectors with code-aware chunking"""
        # Parse gitingest output into files
        files = self._parse_gitingest_output(repo_text)
        
        vectors = []
        for file_info in files:
            file_path = file_info['path']
            content = file_info['content']
            language = self._detect_language(file_path)
            
            # Create code-aware chunks
            chunks = self._create_code_chunks(content, language)
            
            for i, chunk in enumerate(chunks):
                if len(chunk.strip()) < 10:  # Skip very short chunks
                    continue
                    
                # Create semantic embedding
                semantic_vector = self.sentence_model.encode(chunk)
                
                # Create vector
                vector = CodeVector(
                    chunk_id=self._generate_chunk_id(f"{file_path}_{i}"),
                    file_path=file_path,
                    content=chunk,
                    semantic_vector=semantic_vector,
                    metadata={
                        'language': language,
                        'chunk_index': i,
                        'chunk_type': self._detect_chunk_type(chunk, language)
                    },
                    chunk_type='code_chunk'
                )
                vectors.append(vector)
        
        self.vectors = vectors
        return vectors

    def _create_code_chunks(self, content: str, language: str) -> List[str]:
        """Create meaningful code chunks based on language"""
        if language == 'python':
            return self._chunk_python_code(content)
        elif language in ['javascript', 'typescript']:
            return self._chunk_js_code(content)
        elif language == 'java':
            return self._chunk_java_code(content)
        else:
            # Generic chunking for other languages
            return self._chunk_generic_code(content)

    def _chunk_python_code(self, content: str) -> List[str]:
        """Chunk Python code by functions, classes, and imports"""
        chunks = []
        lines = content.split('\n')
        current_chunk = []
        
        for line in lines:
            stripped = line.strip()
            
            # Start new chunk for imports, functions, classes
            if (stripped.startswith(('import ', 'from ')) or 
                stripped.startswith('def ') or 
                stripped.startswith('class ') or
                stripped.startswith('async def ')):
                
                if current_chunk:
                    chunks.append('\n'.join(current_chunk))
                current_chunk = [line]
            else:
                current_chunk.append(line)
        
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks

    def _chunk_js_code(self, content: str) -> List[str]:
        """Chunk JavaScript/TypeScript code by functions, classes, and imports"""
        chunks = []
        lines = content.split('\n')
        current_chunk = []
        
        for line in lines:
            stripped = line.strip()
            
            # Start new chunk for imports, functions, classes
            if (stripped.startswith(('import ', 'export ')) or 
                stripped.startswith('function ') or 
                stripped.startswith('const ') or
                stripped.startswith('let ') or
                stripped.startswith('var ') or
                stripped.startswith('class ') or
                '=>' in stripped):  # Arrow functions
                
                if current_chunk:
                    chunks.append('\n'.join(current_chunk))
                current_chunk = [line]
            else:
                current_chunk.append(line)
        
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks

    def _chunk_java_code(self, content: str) -> List[str]:
        """Chunk Java code by methods, classes, and imports"""
        chunks = []
        lines = content.split('\n')
        current_chunk = []
        
        for line in lines:
            stripped = line.strip()
            
            # Start new chunk for imports, methods, classes
            if (stripped.startswith('import ') or 
                stripped.startswith('public ') or 
                stripped.startswith('private ') or
                stripped.startswith('protected ') or
                stripped.startswith('class ') or
                stripped.startswith('interface ')):
                
                if current_chunk:
                    chunks.append('\n'.join(current_chunk))
                current_chunk = [line]
            else:
                current_chunk.append(line)
        
        if current_chunk:
            chunks.append('\n'.join(current_chunk))
        
        return chunks

    def _chunk_generic_code(self, content: str) -> List[str]:
        """Generic chunking for other languages"""
        # Split by double newlines or function-like patterns
        chunks = re.split(r'\n\s*\n', content)
        return [chunk.strip() for chunk in chunks if chunk.strip()]

    def _detect_chunk_type(self, chunk: str, language: str) -> str:
        """Detect the type of code chunk"""
        chunk_lower = chunk.lower().strip()
        
        if any(keyword in chunk_lower for keyword in ['import ', 'from ', 'require ', 'using ']):
            return 'import'
        elif any(keyword in chunk_lower for keyword in ['def ', 'function ', 'public ', 'private ']):
            return 'function'
        elif any(keyword in chunk_lower for keyword in ['class ', 'interface ']):
            return 'class'
        elif any(keyword in chunk_lower for keyword in ['const ', 'let ', 'var ']):
            return 'variable'
        else:
            return 'code'

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
## {vector.file_path} ({vector.metadata.get('chunk_type', 'code')})
Similarity: {similarity:.3f}
```{vector.metadata.get('language', 'text')}
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
        self.vectorizer = CodeRepositoryVectorizer()
    
    def process_repository(self, repo_text: str) -> Dict[str, Any]:
        """Process repository and return vectorization results"""
        vectors = self.vectorizer.vectorize_repository(repo_text)
        
        return {
            'total_files': len(set(v.file_path for v in vectors)),
            'total_chunks': len(vectors),
            'ready_for_llm': True
        }
    
    def query_repository(self, query: str, repo_text: str = None, include_full_content: bool = False) -> Dict[str, Any]:
        """Query the vectorized repository"""
        if repo_text:
            self.vectorizer.vectorize_repository(repo_text)
        
        # Find similar chunks
        similar_chunks = self.vectorizer.find_similar_chunks(query)
        
        # Generate LLM context
        llm_context = self.vectorizer.generate_llm_context(query)
        
        similar_chunks_data = []
        for vector, score in similar_chunks:
            chunk_data = {
                'file_path': vector.file_path,
                'similarity': float(score),
                'chunk_type': vector.metadata.get('chunk_type', 'code'),
                'language': vector.metadata.get('language', 'unknown'),
                'content_preview': vector.content[:200] + '...' if len(vector.content) > 200 else vector.content
            }
            
            # Include full content if requested
            if include_full_content:
                chunk_data['full_content'] = vector.content
                chunk_data['content_length'] = len(vector.content)
            
            similar_chunks_data.append(chunk_data)
        
        return {
            'query': query,
            'similar_chunks': similar_chunks_data,
            'llm_context': llm_context,
            'ready_for_llm': True
        } 