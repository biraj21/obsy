import express from "express";

const router = express.Router();

router.post("/sync", async (req, res) => {
  const { email, name, image } = req.body;
});

export default router;
