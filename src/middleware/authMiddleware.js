// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { JWT_SECRET } from '../config/config.js';

/**
 * Middleware para verificar token JWT
 * Añade userId y userEmail a req si el token es válido
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header Authorization: Bearer TOKEN
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'No se proporcionó token de autenticación' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Añadir información del usuario a la request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Token expirado' 
      });
    }

    return res.status(500).json({ 
      status: 'error',
      message: 'Error en la autenticación' 
    });
  }
};

/**
 * Middleware para verificar si el usuario es admin
 * Debe usarse después de authMiddleware
 */
export const isAdmin = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT tipo FROM usuarios WHERE id = ?',
      [req.userId]
    );

    if (!users.length || users[0].tipo !== 'admin') {
      return res.status(403).json({ 
        status: 'error',
        message: 'Acceso denegado. Se requieren permisos de administrador' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      status: 'error',
      message: 'Error verificando permisos' 
    });
  }
};