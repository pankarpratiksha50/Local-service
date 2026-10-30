from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

app = FastAPI(title="LocalConnect ML Service", version="0.1.0")

# Tiny demonstration dataset only. Replace with a larger, labeled dataset
# and evaluate with a held-out test set before real use.
TRAIN_TEXTS = [
    "excellent service and friendly professional",
    "the work was completed perfectly",
    "quick response and good quality work",
    "very poor service and rude behavior",
    "the problem was not fixed",
    "late arrival and disappointing work",
    "the technician explained everything clearly",
    "terrible experience and bad repair",
    "good job and fair price",
    "not satisfied with the service",
    "professional arrived on time",
    "the repair failed again"
]
TRAIN_LABELS = [
    "positive", "positive", "positive", "negative", "negative", "negative",
    "positive", "negative", "positive", "negative", "positive", "negative"
]

model = make_pipeline(
    TfidfVectorizer(ngram_range=(1, 2), max_features=3000),
    LogisticRegression(max_iter=1000, random_state=42)
)
model.fit(TRAIN_TEXTS, TRAIN_LABELS)

class ReviewRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)

@app.get("/health")
def health():
    return {"status": "ok", "service": "LocalConnect ML"}

@app.post("/analyze-review")
def analyze_review(request: ReviewRequest):
    text = request.text.strip()
    if not text:
        return {"sentiment": "unknown", "confidence": 0.0}
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    confidence = float(max(probabilities))
    return {
        "sentiment": prediction,
        "confidence": round(confidence, 4),
        "warning": "Demonstration model trained on a tiny sample. Do not use as a reliable real-world classifier."
    }
