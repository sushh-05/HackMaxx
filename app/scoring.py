# app/scoring.py
def compute_worth_score(similarity, prize_tier, days_left):
    skill_fit = similarity * 40
    prize_weight = min(prize_tier, 1) * 25
    reputation = 15
    urgency_bonus = 20 if days_left > 7 else 10
    return round(skill_fit + prize_weight + reputation + urgency_bonus)