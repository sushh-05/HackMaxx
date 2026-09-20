# app/tinyfish_client.py
import os, requests

TINYFISH_KEY = os.getenv("TINYFISH_API_KEY", "")

def search_hackathons(query: str, limit: int = 10):
    resp = requests.get("https://api.search.tinyfish.ai",
                         headers={"Authorization": f"Bearer {TINYFISH_KEY}"},
                         params={"q": query, "limit": limit})
    resp.raise_for_status()
    return resp.json().get("results", [])

def fetch_hackathon_details(url: str):
    resp = requests.post("https://api.fetch.tinyfish.ai",
                          headers={"Authorization": f"Bearer {TINYFISH_KEY}"},
                          json={"url": url, "format": "markdown"})
    resp.raise_for_status()
    return resp.json().get("content", "")