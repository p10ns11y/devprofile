import json

# Load CV data
with open('../src/data/cvdata.json', 'r') as f:
    cvdata = json.load(f)

# Synthesize Q&A pairs
qa_pairs = []

# Personal info variations (20 questions)
personal_answer = f"I'm {cvdata['name']}, a Senior Software Engineer based in {cvdata['home']['current_location']}. {cvdata['short_bio']}. Contact: email {cvdata['contact']['email']}, phone {cvdata['contact']['phone']}, citizenship {cvdata['contact']['citizenship']}. Social links: {', '.join([f'{l['label']}: {l['href']}' for l in cvdata['social_links']])}."
personal_questions = [
    "Tell me about yourself",
    "Who are you?",
    "Introduce yourself",
    "What is your background?",
    "Tell me your profile",
    "What is your one-liner?",
    "Give me your short bio",
    "Where do you live?",
    "What is your contact info?",
    "What are your social links?",
    "What is your full name?",
    "What is your citizenship?",
    "Where is your current location?",
    "Give me your shorter bio",
    "What is your profile summary?",
    "Tell me your name with initial",
    "What is your email?",
    "What is your phone number?",
    "Link to your GitHub?",
    "What is your X handle?"
]
for q in personal_questions:
    qa_pairs.append({"question": q, "answer": personal_answer})

# Work experience: 20 questions per job (6 jobs = 120)
for i, exp in enumerate(cvdata['work_experience']):
    exp_answer = f"I worked as {exp['title']} at {exp['company']} in {exp['location']} from {exp['start_date']} to {exp.get('end_date', 'N/A')} ({exp.get('duration', 'N/A')}). Responsibilities: {'. '.join(exp['responsibilities'])}. Tools: {', '.join(exp['tools'])}."
    exp_questions = [
        f"What was your role at {exp['company']}?",
        f"What did you do at {exp['company']}?",
        f"Tell me about your experience at {exp['company']}",
        f"What responsibilities did you have at {exp['company']}?",
        f"What tools did you use at {exp['company']}?",
        f"What was the duration of your role at {exp['company']}?",
        f"Describe your time at {exp['company']}",
        f"What achievements did you have at {exp['company']}?",
        f"Why did you work at {exp['company']}?",
        f"Give me details on {exp['title']} at {exp['company']}",
        f"What was the start date of your role at {exp['company']}?",
        f"What was the end date of your role at {exp['company']}?",
        f"Tell me about your responsibilities at {exp['company']}",
        f"List the tools you used at {exp['company']}",
        f"What was your title at {exp['company']}?",
        f"Where is {exp['company']} located?",
        f"Describe one responsibility at {exp['company']}",
        f"What is {exp['company']}?",
        f"Tell me a key achievement at {exp['company']}",
        f"How long did you work at {exp['company']}?"
    ]
    for q in exp_questions:
        qa_pairs.append({"question": q, "answer": exp_answer})

# Skills: 20 questions for categories + product/practices (100 total)
skills_answer = ""
for cat in cvdata['skills']['categories']:
    skills_answer += f"{cat['title']}: {', '.join(cat['skills'])}. "
skills_answer += f"Product: {', '.join(cvdata['skills']['product'])}. Practices: {', '.join(cvdata['skills']['practices'])}."
skills_questions = [
    "What are your skills?",
    "List your frontend skills",
    "What backend skills do you have?",
    "Tell me your DevOps skills",
    "What product skills do you possess?",
    "What practices do you follow?",
    "What is your expertise in ReactJS?",
    "Do you know Python?",
    "What AI skills do you have?",
    "List all your skills",
    "What are your frontend and core skills?",
    "Give me your backend and data skills",
    "What DevOps and AI skills do you have?",
    "Tell me your product skills",
    "What practices do you use?",
    "Do you have experience with Jest?",
    "What is your knowledge of AWS?",
    "List your programming practices",
    "What skills do you have in databases?",
    "Give me your full skills list"
]
for q in skills_questions:
    qa_pairs.append({"question": q, "answer": skills_answer})
# Add more variations if needed to reach 100, but 20 is sufficient for now

# Technologies: 10 questions per category (10 categories = 100)
tech_answer = ""
for main_cat, items in cvdata['technologies'].items():
    tech_answer += f"{main_cat}: {', '.join(items)}. "
tech_questions_base = [
    f"What {main_cat.lower()} technologies do you know?",
    f"List your {main_cat.lower()} tools",
    f"Tell me about your {main_cat.lower()} experience",
    f"What is your expertise in {main_cat.lower()}?",
    f"Give me your {main_cat.lower()} list",
    f"Do you know {items[0] if items else 'any'} in {main_cat}?",
    f"What are your favorite {main_cat.lower()} technologies?",
    f"Describe your {main_cat.lower()} skills",
    f"What {main_cat.lower()} do you use?",
    f"List all {main_cat.lower()} you have"
]
for main_cat in cvdata['technologies'].keys():
    for base_q in tech_questions_base:
        q = base_q.replace(main_cat, main_cat)
        qa_pairs.append({"question": q, "answer": tech_answer})

# Projects and OSS: 20 questions per project (4 projects = 80)
projects = cvdata['projects'] + cvdata['hobby_oss_projects']
for proj in projects:
    proj_answer = f"{proj.get('name', proj.get('title'))}: {proj['description']}. URL: {proj['url']}. Technologies: {', '.join(proj.get('technologies', [])) or 'none'}. Impact: {proj.get('impact', 'N/A')}."
    proj_questions = [
        f"What is {proj.get('name', proj.get('title'))}?",
        f"Tell me about {proj.get('name', proj.get('title'))}",
        f"What is the description of {proj.get('name', proj.get('title'))}?",
        f"What technologies did you use in {proj.get('name', proj.get('title'))}?",
        f"What is the URL for {proj.get('name', proj.get('title'))}?",
        f"What is the impact of {proj.get('name', proj.get('title'))}?",
        f"Describe your project {proj.get('name', proj.get('title'))}",
        f"Why did you build {proj.get('name', proj.get('title'))}?",
        f"Tell me the details of {proj.get('name', proj.get('title'))}",
        f"What is {proj.get('name', proj.get('title'))}'s purpose?",
        f"Give me info on {proj.get('name', proj.get('title'))}",
        f"What tech stack for {proj.get('name', proj.get('title'))}?",
        f"Link to {proj.get('name', proj.get('title'))}?",
        f"What does {proj.get('name', proj.get('title'))} do?",
        f"Tell me about your OSS project {proj.get('name', proj.get('title'))}",
        f"What is the image for {proj.get('name', proj.get('title'))}?",
        f"Describe the technologies in {proj.get('name', proj.get('title'))}",
        f"What is the ID of {proj.get('name', proj.get('title'))}?",
        f"Tell me the impact of {proj.get('name', proj.get('title'))}",
        f"Give me a summary of {proj.get('name', proj.get('title'))}"
    ]
    for q in proj_questions:
        qa_pairs.append({"question": q, "answer": proj_answer})

# Education: 20 questions (3 education = 60, but generalized)
education_answer = '. '.join([f"{edu['degree']} at {edu['institution']} ({edu['years']})." for edu in cvdata['education']])
education_questions = [
    "What is your education?",
    "Where did you study Computer Science?",
    "Tell me your degrees",
    "What is your bachelor's degree?",
    "What is your master's degree?",
    "Give me your educational background",
    "What did you study at Uppsala University?",
    "Tell me about your Operations Research degree",
    "What is your Bachelor of Science?",
    "Where is Uppsala University?",
    "What years did you study at NIT?",
    "List your education",
    "What is your highest degree?",
    "Tell me your academic history",
    "What university did you attend?",
    "What is your Computer Science degree?",
    "Give me your education details",
    "What is the institution for your bachelor's?",
    "Tell me about Kadhir Mohideen College",
    "What is your education timeline?"
]
for q in education_questions:
    qa_pairs.append({"question": q, "answer": education_answer})

# Courses: 10 questions
courses_answer = f"Courses: {', '.join(cvdata['courses'])}."
courses_questions = [
    "What courses have you taken?",
    "List your courses",
    "Tell me about your Terraform course",
    "What is LangChain Chat with Your Data?",
    "What courses do you have in LLM?",
    "Give me your course list",
    "What O'Reilly course did you take?",
    "Tell me your HashiCorp course",
    "What is Build LLM Apps with LangChain?",
    "List all your courses"
]
for q in courses_questions:
    qa_pairs.append({"question": q, "answer": courses_answer})

# Certifications: 10 questions
cert_answer = f"Certifications: {', '.join(cvdata['certifications'])}."
cert_questions = [
    "What certifications do you have?",
    "List your certifications",
    "Tell me about EpicReact",
    "What is Google Computational Thinking?",
    "What Coursera certifications do you have?",
    "Give me your certification list",
    "What is Machine Learning Foundations?",
    "Tell me your R Programming cert",
    "What is DataCamp Kaggle tutorial?",
    "List all your certifications"
]
for q in cert_questions:
    qa_pairs.append({"question": q, "answer": cert_answer})

# Publications: 5 questions
pub_answer = f"Publications: {', '.join(cvdata['publications'])}."
pub_questions = [
    "What publications do you have?",
    "List your publications",
    "Tell me about Profiling Energy Efficiency",
    "What is Energy Efficiency as a Orchestration Service?",
    "Give me your publication list"
]
for q in pub_questions:
    qa_pairs.append({"question": q, "answer": pub_answer})

# Languages: 5 questions
lang_answer = f"Languages: {', '.join([f'{k} ({v})' for k, v in cvdata['languages'].items()])}."
lang_questions = [
    "What languages do you speak?",
    "List your languages",
    "What is your English proficiency?",
    "Tell me about your Swedish",
    "Give me your language skills"
]
for q in lang_questions:
    qa_pairs.append({"question": q, "answer": lang_answer})

# Save to JSONL
with open('qa_data.jsonl', 'w') as f:
    for pair in qa_pairs:
        f.write(json.dumps(pair) + '\n')

# Print number of pairs
print(len(qa_pairs))