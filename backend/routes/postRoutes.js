// Handles: the social feed — create post, view posts, like, comment.

const express = require('express');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/posts  — get all posts, newest first
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// POST /api/posts — create a post (with an image file field named "image")
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'An image is required' });

    const post = await Post.create({
      author: req.user.id,
      authorName: req.user.name,
      caption: req.body.caption || '',
      imageUrl: `/uploads/${req.file.filename}`
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Could not create post', error: err.message });
  }
});

// POST /api/posts/:id/like — toggle like on a post
router.post('/:id/like', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const alreadyLiked = post.likes.includes(req.user.id);
  if (alreadyLiked) {
    post.likes = post.likes.filter(id => id.toString() !== req.user.id);
  } else {
    post.likes.push(req.user.id);
  }
  await post.save();
  res.json(post);
});

// POST /api/posts/:id/comment — add a comment
router.post('/:id/comment', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text is required' });

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  post.comments.push({ user: req.user.id, userName: req.user.name, text });
  await post.save();
  res.json(post);
});

module.exports = router;
