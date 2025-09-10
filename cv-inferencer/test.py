from transformers import pipeline

qa_pipeline = pipeline("text2text-generation", model="Peramanathan/cv-qa-model")

question = "What is your experience with React?"
prompt = f"Using the resume of Peramanathan Sathyamoorthy, answer the following question in a concise, conversational, first-person tone, focusing on relevant details from the resume. Avoid including system messages or context in the response. Question: {question}"

response = qa_pipeline(prompt, max_length=150, do_sample=True, temperature=0.7)[0]['generated_text']

clean_response = response.replace("Using the resume of Peramanathan Sathyamoorthy", "").replace("Question:", "").replace("Answer:", "").strip()

print(clean_response)