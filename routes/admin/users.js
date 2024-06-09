import { Router } from 'express';
import { 
  login, 
  signup,
  forget,
  check,
  getUsers,
  updateInfo 
} from '../../controllers/user.js';
import { checkRequestBodyValidator, isAuth } from '../../middlewares/index.js';

const router = Router();

router.use(checkRequestBodyValidator);
// router.post('/login', login);
// router.post('/signup', signup);
// router.post('/forgot', forget);
// router.get('/check', isAuth, check);
router.get('/', isAuth, getUsers);
router.put('/', isAuth, updateInfo);


export default router;
https://music-tutor-backend.onrender.com/users/ckeck
https://music-tutor-backend.onrender.com/users/login