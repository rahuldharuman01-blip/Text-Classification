from flask import Flask, request, jsonify, render_template
from transformers import pipeline

app = Flask(__name__)
classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)
@app.route("/")
def home():
    return render_template("index.html")
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": True,
        "model": "distilbert-base-uncased-finetuned-sst-2-english"
    })
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({
            "error": "No JSON data received"
        }), 400
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400
    result = classifier(text)
    prediction = result[0]["label"]
    confidence = result[0]["score"]
    return jsonify({
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": {
            prediction: confidence
        }
    })

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )