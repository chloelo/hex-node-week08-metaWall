const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts')
const { isAuth } = require('../service/auth');

router.get('/posts', isAuth, postsController.getPosts);
router.post('/post', isAuth, postsController.createPost);
router.delete('/posts', isAuth, postsController.deletePosts);
router.delete('/post/:id', isAuth, postsController.deletePost);
router.patch('/post/:id', isAuth, postsController.patchPost);

module.exports = router;