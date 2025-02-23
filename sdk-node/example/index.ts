import OpenAI from "openai";
import express from "express";
import { Pinecone } from "@pinecone-database/pinecone";
import type { ChatCompletionChunk, ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { ObsyClient, obsyExpress } from "../src/core/index.js";

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
  apiKey: process.env.OBSY_API_KEY!,
  projectId: "67baddf5b7e2b2053738bc60",
  sinkUrl: "http://localhost:8000",
});

// 2. instrument OpenAI and Pinecone clients
obsy.instrument(openai).instrument(pinecone);

// 3. enable tracing for each request
app.use(obsyExpress({ client: obsy }));

// Store conversation history for RAG demo
let messageHistory: ChatCompletionMessageParam[] = [];

const pineconeNs = pinecone.index("obsy").namespace("obsy-rag-example");

app.post("/rag", async (req, res) => {
  const { message } = req.body;

  // Add user message to history
  messageHistory.push({ role: "user", content: message });

  // Generate search query using LLM
  const searchQueryResponse = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Generate a concise search query to find relevant information for the user's question. Focus on key terms and concepts.",
      },
      ...messageHistory,
    ],
    model: "llama3-8b-8192",
    stream: false,
  });

  const searchQuery = searchQueryResponse.choices[0].message.content || "";

  // Generate embeddings for the search query
  const embeddings = await pinecone.inference.embed("llama-text-embed-v2", [searchQuery], {
    inputType: "passage",
    truncate: "END",
  });

  const vector =
    embeddings.data[0].vectorType === "dense" ? embeddings.data[0].values : embeddings.data[0].sparseValues;

  // Query Pinecone
  const results = await pineconeNs.query({
    vector,
    topK: 3,
    includeMetadata: true,
  });

  // Construct prompt with retrieved documents
  const docs = results.matches.map((match) => match.metadata?.text || "").join("\n\n");

  const finalResponseStream = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant. Answer the user's question based on the following context:\n\n${docs}`,
      },
      ...messageHistory,
    ],
    model: "llama3-8b-8192",
    stream: true,
  });

  const chunks: ChatCompletionChunk[] = [];

  // set response headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  for await (const chunk of finalResponseStream) {
    res.write(JSON.stringify(chunk));
    chunks.push(chunk);
  }

  res.end();

  // merge chunks and add to history
  messageHistory.push({
    role: "assistant",
    content: chunks.map((c) => c.choices[0].delta.content).join(""),
  });

  console.log("JSON.stringify(messageHistory)", JSON.stringify(messageHistory, null, 2));
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

import path from "node:path";
import fs from "node:fs/promises";

async function consume(filePath: string) {
  try {
    // Read file content
    const fileContent = await fs.readFile(filePath, "utf-8");

    // Split into paragraphs (split on double newline)
    const paragraphs = fileContent.split(/\n\s*\n/).filter((p) => p.trim());

    // Process each paragraph
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];

      // generate embeddings docs: https://docs.pinecone.io/guides/inference/generate-embeddings
      const embeddings = await pinecone.inference.embed("llama-text-embed-v2", [paragraph], {
        inputType: "passage",
        truncate: "END",
      });

      const vector =
        embeddings.data[0].vectorType === "dense" ? embeddings.data[0].values : embeddings.data[0].sparseValues;

      // Store in Pinecone
      await pineconeNs.upsert([
        {
          id: `doc_${i}`,
          values: vector,

          metadata: {
            text: paragraph,
            source: filePath,
          },
        },
      ]);

      console.log(`Processed paragraph ${i + 1} of ${paragraphs.length}`);
    }

    console.log("File processing complete");
  } catch (error) {
    console.error("Error processing file:", error);
    throw error;
  }
}

// const kb = path.join(import.meta.dirname, "./kb.txt");
// consume(kb);
