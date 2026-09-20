# app/ai_client.py
import os
import hashlib
import json
from dotenv import load_dotenv
load_dotenv()

import numpy as np
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_embedding(text: str):
    """
    Groq doesn't offer an embeddings endpoint, so we generate a
    deterministic pseudo-embedding locally. Same input text always
    produces the same vector, which is enough for consistent
    similarity ranking in this MVP.
    """
    seed = int(hashlib.md5(text.encode()).hexdigest(), 16) % (2**32)
    rng = np.random.default_rng(seed)
    return rng.random(256).tolist()


def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))


def generate_match_explanation(project_desc: str, hackathon: dict):
    prompt = f"""Project: {project_desc}
Hackathon: {hackathon['title']} - {hackathon['description']}
In 2 sentences: why does this match, and what's the reuse/adaptation strategy?
Return ONLY valid JSON in this exact shape: {{"whyMatch": "...", "adaptation": "..."}}"""

    models_to_try = ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "groq/compound-mini"]

    for model_id in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_id,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            text = response.choices[0].message.content
            return json.loads(text)
        except Exception as e:
            print(f"Model {model_id} failed: {repr(e)}")
            continue

    # Fallback if every model fails (rate limit, network issue, etc.)
    return {
        "whyMatch": f"Matches on shared themes with {hackathon['title']}.",
        "adaptation": "Reuse core logic with updated branding and API integration."
    }