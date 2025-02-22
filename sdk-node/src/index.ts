import express from "express";
import OpenAI from "openai";

import { obsyExpress } from "./express/index.js";
import { ObsyClient } from "./core/index.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const obsy = new ObsyClient("obsy-api-key", "obsy-project-id");

// auto-instrument OpenAI completions for each request
app.use(obsyExpress(obsy, openai));

app.post("/chat", async (req, res) => {
  const response = await req.openai.chat.completions.create({
    messages: [{ role: "user", content: "Hello" }],
    model: "llama3-8b-8192",
    stream: false,
  });

  res.send(response);
});

app.post("/chat-stream", async (req, res) => {
  console.log(req.trace.getContext());

  const stream = await req.openai.chat.completions.create({
    messages: [{ role: "user", content: "Hello" }],
    model: "llama3-8b-8192",
    stream: true,
  });

  for await (const chunk of stream) {
    console.log(chunk.choices[0]);
    res.write(JSON.stringify(chunk));
  }

  res.end();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
