// API route that handles POST requests from the frontend, forwards the text to the FastAPI backend for sentiment analysis, and stores the result in MongoDB.

import { NextResponse } from "next/server";
import axios from "axios";
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // call FastAPI backend
    const response = await axios.post(process.env.FASTAPI_URL!, { text });
    const result = response.data;

    // Connect to MongoDB
    await client.connect();
    console.log("✅ MongoDB connection successful")
    const db = client.db('sentiment_db');
    const collection = db.collection('predictions');

    // Store result in MongoDB
    await collection.insertOne({
      text,
      sentiment: result.sentiment,
      confidence: result.confidence,
      timestamp: new Date(),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.log("Error: ", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.close();
  }
}

