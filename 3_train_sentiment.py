import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import make_pipeline

def train_sentiment_agent():
    print("--- Initializing Sentiment Agent Training ---")
    
    try:
        # Load the newly generated standardized dataset
        df = pd.read_csv('processed_data.csv', encoding='utf-8')
        print(f"[DISK] Loaded {len(df)} records.")

        # CRITICAL CONFIURATION:
        # 1. ngram_range=(1, 2) is the key. Catches "is Nongra" as a negative signal.
        # 2. LinearSVC: High-performance text sentiment classifier.
        # 3. class_weight='balanced': Mandatroy to correctly detect rare "Mixed" statuses.
        model = make_pipeline(
            TfidfVectorizer(
                ngram_range=(1, 2), 
                max_features=10000,
                stop_words=None # Keep 'not/no' and local words
            ),
            LinearSVC(class_weight='balanced', random_state=42)
        )

        # Execute Training
        print("[TRAIN] Fitting SVM model with Bigram logic...")
        model.fit(df['text'].astype(str), df['sentiment'].astype(str))

        # Save to Disk
        with open('sentiment_model.pkl', 'wb') as f:
            pickle.dump(model, f)
        
        print("--- [SUCCESS] Sentiment Agent Brain Saved to sentiment_model.pkl ---")

    except FileNotFoundError:
        print("Error: processed_data.csv not found. Run 1_generate_data.py first!")

if __name__ == "__main__":
    train_sentiment_agent()