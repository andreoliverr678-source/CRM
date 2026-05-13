import json
import subprocess

def get_workflows():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OTkzMGRkNy00ZDFkLTRjMmItODA1YS05NGU2NmNjYjZhNDYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMTliNDM0NTctMzcyMS00MmZiLWJmNGQtZjFlNWI5NjRhZjEzIiwiaWF0IjoxNzc4NjkwMzA2fQ.C_mF7KLPGWIgHJRk35HhP0RFDuP-k-b6_-wYwpEADOc"
    url = "https://n8n.andreverissimo.shop/api/v1/workflows"
    
    cmd = ["curl.exe", "-s", "-H", f"X-N8N-API-KEY: {token}", url]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    try:
        data = json.loads(result.stdout)
        for wf in data.get('data', []):
            print(f"ID: {wf['id']} | Name: {wf['name']}")
    except Exception as e:
        print(f"Error: {e}")
        print(result.stdout[:500])

if __name__ == "__main__":
    get_workflows()
