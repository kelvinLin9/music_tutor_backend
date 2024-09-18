import UsersModel from '../models/user.js'
import { generateToken } from '../utils/index.js';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync.js';

const googleLogin = handleErrorAsync(async (req, res, next) => {
  console.log("googleLogin")
  // console.log('req', req.query.callback);
  console.log('req', req.query.state);
  const token = generateToken({ userId: req.user.user._id, role: req.user.user.role })
  // res.send({
  //   status: true,
  //   user: req.user,
  //   token: token
  // });
  res.redirect(`${req.query.state}?token=${token}`);
});


export {
  googleLogin,
};