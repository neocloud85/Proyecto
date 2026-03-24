// src/routes/auth.routes.js
import express from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/auth/register', validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/auth/login', validateLogin, login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario autenticado actual
 * @access  Private
 */
router.get('/auth/me', authMiddleware, getCurrentUser);

export const authRoutes = router;