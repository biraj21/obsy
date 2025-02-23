import express from "express";

import env from "./config/env.js";
import { connectWithRetries } from "./db/index.js";
import router from "./routes/index.js";
import { cors, errorHandler } from "./middlewares/index.js";

// connect to the database
await connectWithRetries();

const app = express();
app.use(express.json());

// cors
app.use(cors);

// log all requests
app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
  });

  req.on("error", (err) => {
    console.log(`${req.method} ${req.url} ${err}`);
  });

  next();
});

app.use("/v1", router);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  console.log(`${req.method} ${req.url}`);
  res.status(404).json({ error: "Not found" });
});

// error handler for entire app
app.use(errorHandler);

const { PORT } = env;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
