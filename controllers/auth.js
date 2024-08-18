import UsersModel from '../models/user.js'
import { generateToken, verifyToken } from '../utils/index.js';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync.js';

const googleLogin = handleErrorAsync(async (req, res, next) => {
  console.log("googleLogin")
  // console.log('req', req.user);
  res.send({
    status: true,
    user: req.user,
    token: generateToken({ userId: req.user._id, role: req.user.role })
  });
});


export {
  googleLogin,
};