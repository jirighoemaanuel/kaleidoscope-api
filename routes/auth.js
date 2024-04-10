import express from 'express';

const router = express.Router();
import { register, login } from '../controllers/auth.js';

router.route('/register').post(register).post(login);

export default router;
