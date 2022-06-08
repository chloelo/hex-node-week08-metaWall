const bcrypt = require('bcryptjs');
const validator = require('validator');

const { generateSendJWT } = require('../service/auth');
const { successHandle } = require('../service');
const { appError } = require("../service/exceptions");
const handleErrorAsync = require("../service/handleErrorAsync");
const User = require('../models/usersModel')

const users = {
  signUp: handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body;
    // 內容不可為空
    if (!email || !password || !confirmPassword || !name) {
      return next(appError("400", "欄位未填寫正確！", next));
    }
    // 密碼正確
    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！", next));
    }
    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError("400", "密碼字數低於 8 碼", next));
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
      return next(appError("400", "Email 格式不正確", next));
    }
    // 檢查信箱有沒有註冊過
    const checkMail = await User.findOne({ email })
    if (checkMail) {
      return next(appError("400", "此信箱已註冊過！", next));
    }
    // 加密密碼
    password = await bcrypt.hash(req.body.password, 12);
    const newUser = await User.create({
      email,
      password,
      name
    });
    generateSendJWT(newUser, 201, res);
  }),

  signIn: handleErrorAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(appError(400, '帳號密碼不可為空', next));
    }
    const user = await User.findOne({ email }).select('+password');
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return next(appError(400, '您的密碼不正確', next));
    }
    generateSendJWT(user, 200, res);
  }),

  updatePassword: handleErrorAsync(async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword) {
      return next(appError(400, '欄位不可為空', next));
    }
    const userOriginal = await User.findById(req.user.id).select('+password');
    const compareNewOldPsw = await bcrypt.compare(password, userOriginal.password);
    if (compareNewOldPsw) {
      return next(appError("400", "新密碼與原密碼相同！", next));
    }
    if (password !== confirmPassword) {
      return next(appError("400", "密碼不一致！", next));
    }
    newPassword = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.user.id, {
      password: newPassword
    });
    generateSendJWT(user, 200, res)
  }),

  getUser: handleErrorAsync(async (req, res, next) => {
    successHandle(res, { user: req.user })
  }),

  updateUser: handleErrorAsync(async (req, res, next) => {
    const { body } = req
    const keys = Object.keys(body)
    if (keys.length === 0) {
      return next(appError(400, "欄位不可為空", next))
    }
    if (keys.indexOf('name') !== -1 && !body.name) {
      return next(appError(400, "名字為必填", next))
    }
    const result = await User.findByIdAndUpdate(req.user.id, body,  {new: true, runValidators: true})
    if (result) {
      successHandle(res, result)
    } else {
      return next(appError(400, "修改檔案失敗", next))
    }
  }),
}
module.exports = users