import UsersModel from '../models/user.js'
import { generateToken, verifyToken } from '../utils/index.js';
import { handleErrorAsync } from '../statusHandle/handleErrorAsync.js';

const createUser = handleErrorAsync(async (profile, cb) => {
  // console.log('profile', profile);
  let user = await UsersModel.findOne({ googleId: profile.id });
  if (!user) {
    user = await UsersModel.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      role: 'user'
    });
  }
  console.log('user', user);
  return cb(null, user);

})
const googleLogin = handleErrorAsync(async (req, res, next) => {
  console.log("googleLogin")
  console.log('req', req.user.googleId);
  res.send({
    status: true,
    user: req.user,
    token: generateToken({ userId: req.user.googleId, role: req.user.role })
  });
});

const googleClientLogin = handleErrorAsync(async (req, res, next) => {
  console.log("googleClientLogin")
  console.log('req', req.user.googleId);
  // res.send({
  //   status: true,
  //   user: req.user,
  //   token: generateToken({ userId: req.user.googleId, role: req.user.role })
  // });
});


export {
  createUser,
  googleLogin,
  googleClientLogin
};