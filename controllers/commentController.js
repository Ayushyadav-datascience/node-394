const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Add comment to post
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    text,
  });

  res.status(201).json(comment);
});

// Get comments for a post
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'username')
    .sort({ createdAt: 1 });

  res.json(comments);
});

// Delete comment (author only)
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }
  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await comment.remove();
  res.json({ message: 'Comment removed' });
});

module.exports = { addComment, getComments, deleteComment };
