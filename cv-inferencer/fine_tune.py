try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, Seq2SeqTrainer, Seq2SeqTrainingArguments
    from datasets import load_dataset
except ImportError as e:
    print(f"Import error: {e}. Please install required packages: pip install -r requirements.txt")
    exit(1)

import os

if not os.path.exists('qa_data.jsonl'):
    print("Error: qa_data.jsonl not found. Please ensure the dataset file exists.")
    exit(1)

tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")

# Load dataset
dataset = load_dataset('json', data_files='qa_data.jsonl', split='train').train_test_split(test_size=0.2)

# Preprocess: Tokenize questions and answers
def preprocess(examples):
    inputs = [f"Question: {q}\nAnswer as Peramanathan Sathyamoorthy in a concise, conversational tone:" for q in examples['question']]
    targets = [a for a in examples['answer']]
    model_inputs = tokenizer(inputs, max_length=512, truncation=True, padding="max_length")
    labels = tokenizer(targets, max_length=128, truncation=True, padding="max_length")
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

tokenized_datasets = dataset.map(preprocess, batched=True)

# Training arguments
training_args = Seq2SeqTrainingArguments(
    output_dir="cv_qa_model",
    eval_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=2,
    per_device_eval_batch_size=2,
    num_train_epochs=5,
    weight_decay=0.01,
    save_total_limit=2,
    push_to_hub=True,  # Push to HF
    hub_model_id="Peramanathan/cv-qa-model",  # Replace with your HF username
    logging_dir='./logs',
    logging_steps=10
)

# Initialize trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    tokenizer=tokenizer
)

try:
    trainer.train()
    trainer.push_to_hub()  # Host on HF Models repo
except Exception as e:
    print(f"Training or upload error: {e}")