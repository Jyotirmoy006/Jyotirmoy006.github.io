import json
import random
from datetime import datetime, timedelta

# Templates with varying sentiment and complex structures
templates = [
    # Positive
    {"text": "The roads are finally smooth and safe.", "lang": "English", "aspects": ["Roads", "Safety"], "status": "Positive"},
    {"text": "Police patrolling is excellent here.", "lang": "English", "aspects": ["Safety"], "status": "Positive"},
    {"text": "খুব পরিষ্কার এলাকা এবং আবর্জনা সময়মতো পরিষ্কার করা হয়।", "lang": "Bengali", "aspects": ["Hygiene"], "status": "Positive"},
    {"text": "सड़कें बहुत अच्छी हैं और लाइट भी जल रही हैं।", "lang": "Hindi", "aspects": ["Roads", "Safety"], "status": "Positive"},
    # Negative
    {"text": "Extremely dark at night, no security at all.", "lang": "English", "aspects": ["Safety"], "status": "Negative"},
    {"text": "Potholes are making travel impossible.", "lang": "English", "aspects": ["Roads"], "status": "Negative"},
    {"text": "বাস ঠিকমতো পাওয়া যায় না, খুব ভিড় হয়।", "lang": "Bengali", "aspects": ["Transit"], "status": "Negative"},
    {"text": "पानी की पाइपलाइन फट गई है, सड़क पर पानी जमा है।", "lang": "Hindi", "aspects": ["Utilities", "Roads"], "status": "Negative"},
    # Complex/Negation (The "Accuracy" testers)
    {"text": "The road is not bad, but it is not safe either.", "lang": "English", "aspects": ["Roads", "Safety"], "status": "Mixed"},
    {"text": "নিরাপত্তা খুব একটা ভালো নয়, তবে রাস্তাগুলো ঠিক আছে।", "lang": "Bengali", "aspects": ["Safety", "Roads"], "status": "Mixed"},
]

locations = ["New Town", "Sector V", "Park Street", "Action Area I", "Action Area II", "Salt Lake", "Behala", "Garia", "Howrah", "Lake Town"]

dataset = []
start_date = datetime.now() - timedelta(days=180)

for i in range(2000):
    t = random.choice(templates)
    loc = random.choice(locations)
    report_date = (start_date + timedelta(days=random.randint(0, 180))).strftime("%Y-%m-%d")
    
    # Simulate detailed AI aspects with individual sentiments
    detailed_aspects = []
    for a in t["aspects"]:
        # If it's a mixed template, assign individual sentiments
        if t["status"] == "Mixed":
            sentiment = "Negative" if "নয়" in t["text"] or "not safe" in t["text"] and a == "Safety" else "Positive"
        else:
            sentiment = t["status"]
        detailed_aspects.append({"name": a, "status": sentiment})

    dataset.append({
        "id": 5000 + i,
        "loc": loc,
        "text": t["text"],
        "lang": t["lang"],
        "aspects": detailed_aspects,
        "status": t["status"],
        "conf": f"{random.uniform(92, 99):.1f}%",
        "time": report_date
    })

with open('historical_data.json', 'w', encoding='utf-8') as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print("✅ 2,000 Records Generated. Accuracy Potential Increased.")