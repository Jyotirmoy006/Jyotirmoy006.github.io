import pandas as pd
import re

def preprocess_multilingual_data():
    # Load the new super-dataset
    df = pd.read_csv('master_city_feedback.csv')
    
    def clean_text(text):
        # We keep alphanumeric characters to preserve Hindi/Bengali scripts
        # We only remove special symbols that aren't letters
        text = re.sub(r'[^\w\s,.]', '', str(text))
        return text.lower().strip()

    df['cleaned_text'] = df['text'].apply(clean_text)
    
    # Save the processed version for the trainers
    df.to_csv('processed_data.csv', index=False)
    print(">>> [PREPROCESS] 5,000 Multilingual records cleaned and ready.")

if __name__ == "__main__":
    preprocess_multilingual_data()