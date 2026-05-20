// src/routes/amistad.routes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  buscarUsuarios,
  enviarSolicitud,
  obtenerSolicitudesPendientes,
  aceptarSolicitud,
  rechazarSolicitud
} from '../controllers/amistad.controller.js';

const router = express.Router();

// Buscar usuarios
router.get('/buscar', authMiddleware, buscarUsuarios);

// Enviar solicitud
router.post('/enviar', authMiddleware, enviarSolicitud);

// Solicitudes pendientes
router.get('/pendientes', authMiddleware, obtenerSolicitudesPendientes);

// Aceptar solicitud
router.post('/aceptar', authMiddleware, aceptarSolicitud);

// Rechazar solicitud
router.post('/rechazar', authMiddleware, rechazarSolicitud);

export const amistadRoutes = router;
