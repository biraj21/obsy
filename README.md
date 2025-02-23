# Obsy

Obsy is an open-source observability platform for AI. _See what your AI is really doing with just a few lines of code._

## Node SDK

```bash
# TODO
npm install obsy
```

Example code with express:

```ts
import { ObsyClient, obsyExpress } from "obsy";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

// initialize OpenAI and Pinecone clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// 1. create Obsy client
const obsy = new ObsyClient({
  apiKey: "your-api-key",
  projectId: "your-project-id",
});

// 2. instrument OpenAI and Pinecone clients
obsy.instrument(openai).instrument(pinecone);

// 3. enable tracing for each request
app.use(obsyExpress({ client: obsy }));

app.post("/chat", async (req, res) => {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Hello" }],
    model: "gpt-4o",
    stream: true, // supports both streaming and non-streaming requests
  });

  for await (const chunk of stream) {
    res.write(JSON.stringify(chunk));
  }

  res.end();
});
```
