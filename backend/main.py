from fastapi import FastAPI
from pydantic import BaseModel
import torch
import torch.nn as nn
import numpy as np

app = FastAPI()

# Define the expected input schema
class TextInput(BaseModel):
    text: str


# Simple LSTM Model for Sentiment Analysis
class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim):
        super(SentimentLSTM, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim)
        self.sigmoid = nn.Sigmoid()

    def forward(self, text):
        embedded = self.embedding(text)
        _, (hidden, _) = self.lstm(embedded)
        output = self.fc(hidden.squeeze(0))
        return self.sigmoid(output)

# Mock vocabulary and preprocessing
VOCAB = {"good": 1, "bad": 2, "happy": 3, "sad": 4, "movie": 5, "<PAD>": 0}
VOCAB_SIZE = len(VOCAB)
MAX_LENGTH = 10

def preprocess_text(text: str):
    words = text.lower().split()
    indices = [VOCAB.get(word, 0) for word in words][:MAX_LENGTH]
    indices += [0] * (MAX_LENGTH - len(indices))  # Padding
    return torch.tensor([indices], dtype=torch.long)

# Load model (simulated pre-trained model)
model = SentimentLSTM(vocab_size=VOCAB_SIZE, embedding_dim=50, hidden_dim=100, output_dim=1)
model.eval()

@app.post("/predict")
async def predict(input: TextInput):
    try:
      # Preprocess input
      input_tensor = preprocess_text(input.text)

      # Run inference
      with torch.no_grad():
        output = model(input_tensor)
        confidence = output.item()
        sentiment = "Positive" if confidence > 0.5 else "Negative"

      return {
        "text": input.text,
        "sentiment": sentiment,
        "confidence": confidence
      }
    except Exception as e:
      return { "error": str(e) }
