const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');

// Create a post
const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const post = await Post.create({
    author: req.user._id,
    title,
    content,
  });

  res.status(201).json(post);
});

// Get all posts
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username bio')
    .sort({ createdAt: -1 });
  res.json(posts);
});

// Get single post by ID
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username bio');
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(post);
});

// Update post (author only)
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title, content } = req.body;
  post.title = title || post.title;
  post.content = content || post.content;
  post.updatedAt = Date.now();

  const updatedPost = await post.save();
  res.json(updatedPost);
});

// Delete post (author only)
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await post.remove();
  res.json({ message: 'Post removed' });
});

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
