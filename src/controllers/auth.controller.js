// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { JWT_SECRET, JWT_EXPIRATION } from '../config/config.js';

/**
 * Clase para errores personalizados
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena } = req.body;

    // Validar campos requeridos
    if (!nombre || !correo || !contrasena) {
      throw new AppError('Nombre, correo y contraseña son obligatorios', 400);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      throw new AppError('Formato de correo inválido', 400);
    }

    // Validar longitud de contraseña
    if (contrasena.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Verificar si el email ya existe
    const [existingUsers] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existingUsers.length > 0) {
      throw new AppError('El correo ya está registrado', 409);
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar usuario
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, hashedPassword]
    );

    // Obtener el usuario creado
    const [newUser] = await db.query(
      'SELECT id, nombre, correo, avatar, tipo, fecha_creacion FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    // Generar token JWT
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].correo },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      token,
      user: newUser[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    // Validar campos
    if (!correo || !contrasena) {
      throw new AppError('Correo y contraseña son obligatorios', 400);
    }

    // Buscar usuario con contraseña
    const [users] = await db.query(
      'SELECT id, nombre, correo, contrasena, avatar, tipo, activo FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (users.length === 0) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const user = users[0];

    // Verificar si está activo
    if (!user.activo) {
      throw new AppError('Usuario desactivado', 403);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id, email: user.correo },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Eliminar contraseña de la respuesta
    delete user.contrasena;

    res.json({
      status: 'success',
      message: 'Login exitoso',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener usuario actual
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, nombre, correo, avatar, tipo, bio, fecha_creacion FROM usuarios WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      status: 'success',
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
};