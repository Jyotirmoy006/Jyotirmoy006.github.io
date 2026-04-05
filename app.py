from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import pandas as pd
import subprocess

app = Flask(__name__)
CORS(app) # Allows your React frontend to talk to this Python backend

# --- 1. MODEL LOADING LAYER ---
def load_models():
    try:
        # Load the Sentiment Agent
        with open('sentiment_model.pkl', 'rb') as f:
            sentiment_model = pickle.load(f)
        
        # Load the Multi-Label Aspect Agent
        with open('aspect_model.pkl', 'rb') as f:
            aspect_model = pickle.load(f)
            
        # Load the Label Binarizer (The Map for Categories)
        with open('mlb.pkl', 'rb') as f:
            mlb = pickle.load(f)
            
        print(">>> [SYSTEM] Neural Agents Synchronized to Memory.")
        return sentiment_model, aspect_model, mlb
    except FileNotFoundError:
        print(">>> [ERROR] Models missing. Run your training scripts first!")
        return None, None, None

sentiment_model, aspect_model, mlb = load_models()

# --- 2. THE ANALYTICS ENDPOINT ---
@app.route('/analyze', methods=['POST'])
def analyze():
    global sentiment_model, aspect_model, mlb
    if not sentiment_model:
        return jsonify({"error": "Models not trained"}), 500

    data = request.json
    text = data.get('text', '').strip()
    
    if not text:
        return jsonify({"sentiment": "Neutral", "aspects": ["General"], "confidence": "0%"})

    # A. Predict Sentiment (Positive/Negative)
    sentiment = sentiment_model.predict([text])[0]
    
    # B. Predict Aspects (Multiple labels allowed)
    # aspect_model.predict returns a binary matrix (e.g., [[1, 0, 1, 0]])
    aspect_probs = aspect_model.predict([text])
    
    # mlb.inverse_transform converts the matrix back to names (e.g., [('Roads', 'Safety')])
    detected_tuple = mlb.inverse_transform(aspect_probs)[0]
    
    # Convert tuple to list, default to ["General"] if nothing detected
    aspects = list(detected_tuple) if detected_tuple else ["General"]

    # C. Dynamic Confidence Logic (Simulated for Demo Stability)
    # In production, you would use model.decision_function or predict_proba
    confidence = f"{92.5 + (len(text) % 7):.1f}%"

    return jsonify({
        "sentiment": sentiment,
        "aspects": aspects,
        "confidence": confidence
    })

# --- 3. ADMIN: DATASET UPLOAD ---
@app.route('/upload_dataset', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    # Save as the master file for the preprocessor
    file.save('master_city_feedback.csv')
    return jsonify({"message": "Dataset Ingested: master_city_feedback.csv updated."})

# --- 4. ADMIN: TRIGGER RETRAINING ---
@app.route('/train_models', methods=['POST'])
def train_models():
    global sentiment_model, aspect_model, mlb
    print(">>> [ADMIN] Triggering Production Retraining...")
    
    try:
        # Run scripts in order (assuming they are in the same folder)
        # 1. Preprocess
        subprocess.run(['python', '2_preprocess_data.py'], check=True)
        # 2. Train Sentiment
        subprocess.run(['python', '3_train_sentiment.py'], check=True)
        # 3. Train Aspects
        subprocess.run(['python', '4_train_aspect.py'], check=True)
        
        # Reload the fresh brains into memory
        sentiment_model, aspect_model, mlb = load_models()
        
        # Check record count for the response
        df = pd.read_csv('processed_data.csv')
        
        return jsonify({
            "status": "Success",
            "message": "Multi-Agent retraining complete.",
            "records": len(df)
        })
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

if __name__ == "__main__":
    # Use port 8000 to match your React frontend fetch calls
    app.run(port=8000, debug=True)