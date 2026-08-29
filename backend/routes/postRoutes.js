const express = require("express");
const Post = require("../models/Post");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Sab routes protected hain — sirf logged-in user access kar sakta hai
router.use(protect);

// GET /api/posts - sirf apne posts get karo
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /api/posts - naya post banao
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const post = await Post.create({ title, content, owner: req.user._id });
    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/posts/:id - post update karo
router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findOne({ _id: req.params.id, owner: req.user._id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;
    await post.save();

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/posts/:id - post delete karo
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;