import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.svm import LinearSVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import MultiLabelBinarizer

def train_aspect_agent():
    print("--- Initializing Multi-Agent Aspect Training ---")
    
    try:
        # Load the newly generated standardized dataset
        df = pd.read_csv('processed_data.csv', encoding='utf-8')
        
        # NEURAL COLUMN GUARD: Detect column names automatically
        col_name = 'aspects_list' if 'aspects_list' in df.columns else 'aspects'
        if col_name not in df.columns:
            print("Error: Could not find category column in processed_data.csv. Run generator script first!")
            return

        print(f"[DISK] Loaded {len(df)} records using column: '{col_name}'")

        # 1. Prepare Multi-Label target (Y)
        # We transform "Roads,Hygiene" strings into a binary matrix
        mlb = MultiLabelBinarizer()
        
        # Ensure we split by comma to separate the categories
        # Also handles any missing values safely
        aspect_data = df[col_name].astype(str).fillna("General")
        y = mlb.fit_transform(aspect_data.str.split(','))
        
        print(f"[LABELS] Target Agents: {list(mlb.classes_)}")

        # 2. Build the Multi-Label SVM Pipeline
        # ngram_range=(1, 2) ensures "Toto stand" triggers Transit correctly
        model = make_pipeline(
            TfidfVectorizer(
                ngram_range=(1, 2), 
                max_features=10000
            ),
            OneVsRestClassifier(LinearSVC(class_weight='balanced', random_state=42))
        )

        # 3. Execute Training
        print("[TRAIN] Fitting OneVsRest SVM model for multi-category detection...")
        model.fit(df['text'].astype(str), y)

        # 4. Save Model AND the Binarizer
        # MLB is required by app.py to decode the result from numbers to names
        with open('aspect_model.pkl', 'wb') as f:
            pickle.dump(model, f)
            
        with open('mlb.pkl', 'wb') as f:
            pickle.dump(mlb, f)

        print("--- [SUCCESS] Aspect Agent Brain Saved to aspect_model.pkl ---")
        print("--- [SUCCESS] Label Map Saved to mlb.pkl ---")

    except FileNotFoundError:
        print("Error: processed_data.csv not found. Run 1_generate_data.py first!")
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    train_aspect_agent()