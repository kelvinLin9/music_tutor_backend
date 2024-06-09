import { Router } from 'express';
import { 
  getUsers,
  updateInfo 
} from '../../controllers/user.js';
import { checkRequestBodyValidator, isAuth } from '../../middlewares/index.js';

const router = Router();

router.use(checkRequestBodyValidator);
router.get('/', isAuth, getUsers);
router.put('/', isAuth, updateInfo);


export default router;