#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys

import stat

# Configuration
PUBLIC_REPO_URL = "https://github.com/CypherVantageAI/CypherVantageAI.github.io.git"
TEMP_DEPLOY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scratch", "deploy_temp")
FILES_TO_COPY = [
    "index.html",
    "app.js",
    "styles.css",
    "CypherVantage-AI.png",
    "src"
]

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def run_cmd(args, cwd=None):
    result = subprocess.run(args, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        print(f"Error running command: {' '.join(args)}")
        print(f"STDOUT:\n{result.stdout}")
        print(f"STDERR:\n{result.stderr}")
        raise RuntimeError(f"Command failed: {result.stderr}")
    return result.stdout.strip()

def main():
    print("====================================================")
    print("CYPHER VANTAGE - PUBLIC PAGES DEPLOYMENT UTILITY")
    print("====================================================")
    
    # 1. Clean up old temp directories
    if os.path.exists(TEMP_DEPLOY_DIR):
        print(f"Cleaning up previous temp directory: {TEMP_DEPLOY_DIR}...")
        shutil.rmtree(TEMP_DEPLOY_DIR, onexc=remove_readonly)
        
    os.makedirs(os.path.dirname(TEMP_DEPLOY_DIR), exist_ok=True)
    
    # 2. Get latest commit info from local private repository
    try:
        commit_hash = run_cmd(["git", "rev-parse", "--short", "HEAD"])
        commit_msg = run_cmd(["git", "log", "-1", "--pretty=%B"])
        deploy_commit_msg = f"deploy: Sync with private core-platform dev branch ({commit_hash}) - {commit_msg.strip()}"
    except Exception as e:
        deploy_commit_msg = "deploy: Sync static build release from private dev repository"
        print(f"[WARNING] Could not retrieve git log parameters: {e}")

    # 3. Clone public repo
    print(f"Cloning public target repository: {PUBLIC_REPO_URL}...")
    try:
        run_cmd(["git", "clone", PUBLIC_REPO_URL, TEMP_DEPLOY_DIR])
    except Exception as e:
        print(f"\n[FAIL] Could not clone destination repository: {e}")
        print("Please verify that you created the repository 'CypherVantageAI.github.io' as a public repo under CypherVantageAI.")
        sys.exit(1)
        
    # 4. Clean out files in the cloned directory (keeping .git metadata)
    print("Preparing public target directory...")
    for item in os.listdir(TEMP_DEPLOY_DIR):
        if item == ".git":
            continue
        path = os.path.join(TEMP_DEPLOY_DIR, item)
        if os.path.isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)
            
    # 5. Copy release files
    print("Copying build artifacts to deploy target...")
    source_dir = os.path.dirname(os.path.abspath(__file__))
    for f in FILES_TO_COPY:
        src_path = os.path.join(source_dir, f)
        dest_path = os.path.join(TEMP_DEPLOY_DIR, f)
        
        if not os.path.exists(src_path):
            print(f"[WARNING] Source file/folder does not exist: {f}")
            continue
            
        if os.path.isdir(src_path):
            shutil.copytree(src_path, dest_path)
        else:
            shutil.copy2(src_path, dest_path)
            
    # 6. Stage, commit and push to public repository
    print("Committing and pushing release build...")
    try:
        # Configure Git if not configured in the cloned environment
        run_cmd(["git", "config", "user.name", "Cypher Vantage Deployer"], cwd=TEMP_DEPLOY_DIR)
        run_cmd(["git", "config", "user.email", "deployer@cyphervantage.ai"], cwd=TEMP_DEPLOY_DIR)
        
        run_cmd(["git", "add", "."], cwd=TEMP_DEPLOY_DIR)
        
        # Check if there are differences to commit
        diff = run_cmd(["git", "status", "--porcelain"], cwd=TEMP_DEPLOY_DIR)
        if not diff:
            print("[OK] No changes detected. Public repository is already up to date.")
            shutil.rmtree(TEMP_DEPLOY_DIR, onexc=remove_readonly)
            sys.exit(0)
            
        run_cmd(["git", "commit", "-m", deploy_commit_msg], cwd=TEMP_DEPLOY_DIR)
        run_cmd(["git", "push", "origin", "main"], cwd=TEMP_DEPLOY_DIR)
        print("\n[SUCCESS] Platform deployed successfully to https://cyphervantageai.github.io/")
    except Exception as e:
        print(f"\n[FAIL] Deployment failed: {e}")
        sys.exit(1)
        
    # 7. Clean up
    if os.path.exists(TEMP_DEPLOY_DIR):
        shutil.rmtree(TEMP_DEPLOY_DIR, onexc=remove_readonly)
        
if __name__ == "__main__":
    main()
