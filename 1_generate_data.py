import pandas as pd
import random
import json
import os

# --- THE SUPREME MULTILINGUAL CIVIC DICTIONARY ---
keywords = {
    "Roads": {
        "words": [
            "road", "sadak", "rasta", "pothole", "highway", "flyover", "path", "gorto", "sarak", 
            "gully", "lane", "divider", "asphalt", "pavement", "bridge", "pul", "mod", "mor", 
            "crossing", "chowk", "intersection", "pitch", "bumpy"
        ],
        "pos": ["excellent", "smooth", "bhalo", "thik hai", "shundor", "pitched", "clean", "perfect", "darun"],
        "neg": ["broken", "baje", "kharab", "gaddha", "poor", "danger", "kaada", "potholed", "narrow", "pitch-out"]
    },
    "Hygiene": {
        "words": [
            "garbage", "waste", "cleanliness", "dustbin", "stench", "drain", "sewage", "litter", "trash", "smell", "sanitation", 
            "gandagi", "kachra", "nongra", "naala", "aborjna", "sewage", "nikashi", "vapa", "moila", "trash", "vat"
        ],
        "pos": ["clean", "safai", "porishkar", "shaf", "smell-free", "sanitized", "excellent", "spotless"],
        "neg": ["dirty", "ganda", "stinks", "full", "badhu", "nongra", "baje", "overflowing", "clogged", "filthy"]
    },
    "Safety": {
        "words": [
            "police", "lighting", "safe", "suraksha", "nirapotta", "alo", "dark", "cctv", "security", 
            "guard", "patrol", "phari", "thana", "lamp post", "street light", "protection", "prahari"
        ],
        "pos": ["safe", "secure", "bright", "helpful", "bhalo", "thik hai", "well-lit", "peaceful", "active"],
        "neg": ["dark", "unsafe", "ondhokar", "bhoy", "dangerous", "churi", "dar", "crime", "robbery", "scary"]
    },
    "Transit": {
        "words": [
            "bus", "metro", "auto", "toto", "rickshaw", "traffic", "janbahon", "gaadi", "yatayat", 
            "transport", "shuttle", "commute", "stand", "frequency", "vahan", "cab", "taxi"
        ],
        "pos": ["fast", "available", "on time", "khub bhalo", "excellent", "easy", "connected", "smooth"],
        "neg": ["slow", "crowded", "bhir", "baje", "late", "traffic jam", "no frequency", "expensive", "congested"]
    }
}

locations = ["Newtown", "Salt Lake", "Sector V", "Garia", "Behala", "Lake Town", "Kestopur", " Dum Dum"]

def generate_supreme_dataset(count=5000):
    print("--- Generatng 5,000 perfectly mapped records... ---")
    data_list = []
    for i in range(count):
        num_aspects = random.choices([1, 2, 3], weights=[50, 40, 10])[0]
        selected_keys = random.sample(list(keywords.keys()), k=num_aspects)
        
        sentence_parts = []
        aspect_objects = []

        for key in selected_keys:
            word = random.choice(keywords[key]["words"])
            status = random.choice(["Positive", "Negative"])
            # Create segments that guarantee the right labels in training
            adj = random.choice(keywords[key]["pos" if status == "Positive" else "neg"])
            aspect_objects.append({"name": key, "status": status})
            sentence_parts.append(f"The {word} is {adj}")

        # Sentiment Logic (Mixed support)
        has_pos = any(a['status'] == "Positive" for a in aspect_objects)
        has_neg = any(a['status'] == "Negative" for a in aspect_objects)
        overall_mood = "Mixed" if has_pos and has_neg else ("Positive" if has_pos else "Negative")

        data_list.append({
            "id": i + 1,
            "text": " and ".join(sentence_parts) + ".",
            "loc": random.choice(locations),
            "sentiment": overall_mood,
            "aspects": aspect_objects,
            "conf": f"{random.uniform(96, 99.9):.1f}%",
            "time": "06:51 PM"
        })
    
    # 1. SAVE CSV FOR TRAINING (standardized column names)
    df = pd.DataFrame(data_list)
    df_train = df.copy()
    # Flattens nested aspects to simple "Roads,Safety" strings for MLB
    df_train['aspects_list'] = df_train['aspects'].apply(lambda x: ",".join([a['name'] for a in x]))
    df_train.to_csv('processed_data.csv', index=False, encoding='utf-8')
    print(">>> [SUCCESS] processed_data.csv saved (CSV).")

    # 2. SAVE JSON FOR REACT FRONTEND
    # This ensures your frontend reads standard JSON lists, not Python dictionary strings.
    json_path = r"C:\Users\Jyotirmoy\OneDrive\Desktop\CivicPulse_Project\frontend\src\data\historical_data.json"
    if not os.path.exists(os.path.dirname(json_path)):
        os.makedirs(os.path.dirname(json_path))
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data_list, f, indent=4, ensure_ascii=False)
    
    print(f">>> [SUCCESS] historical_data.json synced to {json_path}")

if __name__ == "__main__":
    generate_supreme_dataset(5000)