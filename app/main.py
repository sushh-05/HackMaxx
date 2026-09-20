# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.mock_data import HACKATHONS
from app.ai_client import get_embedding, cosine_similarity, generate_match_explanation
from app.scoring import compute_worth_score

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectRequest(BaseModel):
    projectTitle: str
    description: str
    stack: list[str] = []
    tags: list[str] = []

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recommend")
def recommend(req: ProjectRequest):
    project_embedding = get_embedding(req.description)

    scored = []
    for h in HACKATHONS:
        h_embedding = get_embedding(h["description"])
        sim = cosine_similarity(project_embedding, h_embedding)
        score = compute_worth_score(sim, h["prizeTier"], h["daysLeft"])
        explanation = generate_match_explanation(req.description, h)
        scored.append({
            "id": h["id"], "title": h["title"], "url": h["url"], "platform": h["platform"],
            "deadline": h["deadline"], "prize": h["prize"], "mode": h["mode"], "tags": h["tags"],
            "worthScore": score,
            "reusePotential": "High" if score > 70 else "Medium",
            "whyMatch": explanation["whyMatch"], "adaptation": explanation["adaptation"]
        })

    ranked = sorted(scored, key=lambda x: x["worthScore"], reverse=True)[:5]
    strategy = {
        "headline": "Target these 3 first",
        "topIds": [r["id"] for r in ranked[:3]],
        "summary": f"Focus on {ranked[0]['title']} first — highest fit and reuse potential." if ranked else "No matches found."
    }
    return {"projectTitle": req.projectTitle, "recommendations": ranked, "strategy": strategy}

@app.post("/hackathons/refresh")
def refresh():
    try:
        from app.tinyfish_client import search_hackathons
        results = search_hackathons("remote hackathon deadline 2026 AI", limit=5)
        return {"found": len(results), "results": results}
    except Exception as e:
        print("TINYFISH ERROR:", repr(e))
        return {"found": 0, "results": [], "error": "TinyFish unavailable, using seed data instead"}