#!/usr/bin/env python3

import os
import subprocess
import re
from pathlib import Path

def update_imports(file_path):
    """Update relative imports to @/ aliases in the file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace relative imports in from statements with @/ aliases
    content = re.sub(r'from\s+[\'"](?:\.\./)+(.+)[\'"]', r'from "@/\1"', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def get_target_path(src_path):
    """Get the target path for App Router."""
    path = Path(src_path)
    relative_path = path.relative_to('src/pages')
    
    if relative_path.parts[0] == 'api':
        # API routes stay in app/api/
        return Path('src/app') / relative_path
    else:
        # Page files
        dirname = relative_path.parent
        page_name = relative_path.stem  # e.g., index, about, [page]
        
        if dirname == Path('.'):
            if page_name == 'index':
                return Path('src/app/page.tsx')
            else:
                return Path('src/app') / page_name / 'page.tsx'
        else:
            if page_name == 'index':
                return Path('src/app') / dirname / 'page.tsx'
            else:
                return Path('src/app') / dirname / page_name / 'page.tsx'

def main():
    pages_dir = Path('src/pages')
    app_dir = Path('src/app')
    
    if not pages_dir.exists():
        print("src/pages/ not found. Nothing to migrate.")
        return
    
    # Ensure src/app exists
    app_dir.mkdir(parents=True, exist_ok=True)
    
    # Collect all moves
    moves = []
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                src_path = Path(root) / file
                target_path = get_target_path(src_path)
                
                # Create target directory
                target_path.parent.mkdir(parents=True, exist_ok=True)
                
                moves.append((src_path, target_path))
    
    # Execute moves
    for src, dst in moves:
        print(f"Moving {src} to {dst}")
        if dst.exists():
            print(f"Warning: {dst} already exists, skipping.")
            continue
        
        subprocess.run(['git', 'mv', str(src), str(dst)], check=True)
        
        # Update imports if it's a page file
        if dst.suffix == '.tsx':
            update_imports(str(dst))
    
    # Clean up empty directories
    for root, dirs, files in os.walk(pages_dir, topdown=False):
        for dir in dirs:
            dir_path = Path(root) / dir
            if not list(dir_path.iterdir()):
                dir_path.rmdir()
    
    print("Generic migration complete! Review and test the app.")

if __name__ == '__main__':
    main()
