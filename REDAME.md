# Obsy - see what your AI is really doing

Obsy is an open-source observability platform for AI that. See what your AI is really doing with just a few lines of code.

## Node SDK

```bash
# TODO
npm install @obsy/node
```

Example code with express:

```ts
import { ObsyClient, obsyExpress } from "@obsy";

// 1. create Obsy client
const obsy = new ObsyClient({
  apiKey: "your-api-key",
  projectId: "your-project-id",
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 2. auto-instrument OpenAI completions using the middleware. YEAH, THAT'S IT!
app.use(obsyExpress({ client: obsy, openai }));

app.post("/chat", async (req, res) => {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Hello" }],
    model: "llama3-8b-8192",
    stream: true, // works with both streaming and non-streaming requests
  });

  for await (const chunk of stream) {
    res.write(JSON.stringify(chunk));
  }

  res.end();
});
```
