const { successHandle } = require('../service')
const { appError } = require("../service/exceptions");
const handleErrorAsync = require("../service/handleErrorAsync");
const Post = require('../models/postsModel')
const User = require('../models/usersModel')
const posts = {
  getPosts: handleErrorAsync(async (req, res) => {
    // asc 遞增 (由小到大，由舊到新) createdAt ; desc 遞減 (由大到小、由新到舊) "-createdAt"
    const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt"
    const q = req.query?.search ? { "content": new RegExp(req.query.search) } : {};
    const allPosts = await Post.find(q).populate({
      path: 'user',
      select: 'name photo '
    }).sort(timeSort);

    successHandle(res, allPosts)
  }),
  createPost: handleErrorAsync(async (req, res, next) => {
    const { body } = req
    const keys = Object.keys(body)
    if (keys.length === 0) {
      return next(appError(400, "欄位不可為空", next))
    }
    if (body.content) {
      const newPost = await Post.create({
        user: req.user.id,
        image: body.image,
        content: body.content,
        likes: body.likes
      })
      successHandle(res, newPost)
    } else {
      return next(appError(400, "你沒有填寫 content 資料", next))
    }
  }),
  deletePosts: handleErrorAsync(async (req, res) => {
    const posts = await Post.deleteMany({})
    successHandle(res, posts)
  }),
  deletePost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params
    const result = await Post.findByIdAndDelete(id, { new: true })
    if (result) {
      successHandle(res, result)
    } else {
      return next(appError(400, "查無此 ID", next))
    }
  }),
  patchPost: handleErrorAsync(async (req, res, next) => {
    const { id } = req.params
    const { body } = req
    const keys = Object.keys(body)
    if (keys.length === 0) {
      return next(appError(400, "欄位不可為空", next))
    }
    if (keys.indexOf('content') !== -1 && !body.content) {
      return next(appError(400, "你沒有填寫 content 資料", next))
    }
    const result = await Post.findByIdAndUpdate(id, body, { new: true })
    if (result) {
      successHandle(res, result)
    } else {
      return next(appError(400, "貼文更新失敗", next))
    }

  }),
}

module.exports = posts
