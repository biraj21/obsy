import OpenAI from "openai";
import express from "express";
import { Pinecone } from "@pinecone-database/pinecone";

import { ObsyClient, obsyExpress } from "./core/index.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

// initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// 1. initialize Obsy client with local server URL
const obsy = new ObsyClient({
  apiKey: "test-api-key",
  projectId: "test-project-id",
  sinkUrl: "http://localhost:8000",
});

// 2. instrument OpenAI and Pinecone clients
obsy.instrument(openai).instrument(pinecone);

// 3. enable tracing for each request
app.use(obsyExpress({ client: obsy }));

app.post("/chat", async (req, res) => {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Hello" }],
    model: "llama3-8b-8192",
    stream: false,
  });

  res.send(response);
});

app.post("/search", async (req, res) => {
  console.log(req.body);
  const { query, indexName = "obsy" } = req.body;

  console.log(query);

  // generate embeddings docs: https://docs.pinecone.io/guides/inference/generate-embeddings
  // const embeddings = await req.pinecone.inference.embed("llama-text-embed-v2", [query], {
  //   inputType: "passage",
  //   truncate: "END",
  // });

  // const vector =
  //   embeddings.data[0].vectorType === "dense" ? embeddings.data[0].values : embeddings.data[0].sparseValues;

  const vector = [0.1, 0.2, 0.3];

  const index = pinecone.index(indexName);
  const results = await index.query({
    vector,
    topK: 5,
    includeMetadata: true,
  });

  res.json(results);
});

app.post("/chat-stream", async (req, res) => {
  const stream = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Hello" }],
    model: "llama3-8b-8192",
    stream: true,
  });

  for await (const chunk of stream) {
    res.write(JSON.stringify(chunk));
  }

  res.end();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
