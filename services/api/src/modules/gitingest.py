import tempfile
from typing import Optional, Tuple
from gitingest import ingest_async
import os

async def generate_gitingest_txt(
    repository_url: str,
    token: Optional[str] = None,
    include_submodules: bool = False,
    include_gitignored: bool = False,
    filename: Optional[str] = None
) -> Tuple[str, str]:
    """
    Generate a text file from a Git repository using gitingest and return the file path and download name.
    """
    # Set token as environment variable if provided
    if token:
        os.environ["GITHUB_TOKEN"] = token

    # Create a temporary file for the output
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_file:
        temp_file_path = temp_file.name

    # Use gitingest to generate the text file
    # Note: include_submodules and include_gitignored are not supported in this version
    summary, tree, content = await ingest_async(
        repository_url,
        token=token,
        output=temp_file_path
    )

    # Determine the download filename
    if filename:
        download_name = filename
    else:
        repo_name = repository_url.rstrip('/').split('/')[-1]
        download_name = f"gitingest_{repo_name}.txt"

    return temp_file_path, download_name 