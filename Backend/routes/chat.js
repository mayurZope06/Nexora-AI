import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

//test
router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "12345",
      title: "Test Thread",
    });

    const response = await thread.save();
    res.send(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

//get all threads
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    //desc order of updatedAt .. most recent data on top
    res.json(threads);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", async (req, res) => {
  const {threadId} = req.params;
  try {
    const thread = await Thread.findOne({ threadId, userId: req.user._id });
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json(thread.messages);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.delete("/thread/:threadId", async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.user._id });
    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    res.status(200).json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to delete thread" });
  }
});

router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "threadId and message are required" });
  }
  try {
    let thread = await Thread.findOne({ threadId, userId: req.user._id });
    if (!thread) {
      //create a new thread in DB
      thread = new Thread({
        userId: req.user._id,
        threadId,
        title: message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getOpenAIAPIResponse(message);

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    res.json({ reply: assistantReply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to save chat" });
  }
});

router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return res.json([]);

  const titleAnd = words.map(w => ({ title: { $regex: w, $options: "i" } }));

  try {
    const threads = await Thread.find(
      { $and: titleAnd, userId: req.user._id },
      { threadId: 1, title: 1, updatedAt: 1 }
    ).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
