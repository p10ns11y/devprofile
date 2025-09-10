import json

# Load CV data
with open('cvdata.json', 'r') as f:
    cvdata = json.load(f)

# Synthesize Q&A pairs
qa_pairs = []

# Personal
qa_pairs.append({
    "question": "Tell me about yourself",
    "answer": f"I'm {cvdata['name']}, a Senior Software Engineer based in {cvdata['home']['current_location']}. {cvdata['short_bio']}"
})

# Work Experience (5 questions per job)
for i, exp in enumerate(cvdata['work_experience']):
    qa_pairs.append({
        "question": f"What was your role at {exp['company']}?",
        "answer": f"I worked as {exp['title']} at {exp['company']} from {exp['start_date']} to {exp['end_date']}, where I {exp['responsibilities'][0]}"
    })
    # Add more variations: "What tools did you use?", "What achievements there?"

# Skills/Projects (similarly generate)

# Save to JSONL for HF Datasets
with open('qa_data.jsonl', 'w') as f:
    for pair in qa_pairs:
        f.write(json.dumps(pair) + '\n')