// src/controllers/amistad.controller.js
import db from '../config/database.js';

/**
 * Buscar usuarios por nombre
 */
export const buscarUsuarios = async (req, res, next) => {
  try {
    const { q } = req.query;

    const [rows] = await db.query(
      `SELECT id, nombre, avatar 
       FROM usuarios 
       WHERE nombre LIKE ? 
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Enviar solicitud de amistad
 */
export const enviarSolicitud = async (req, res, next) => {
  try {
    const emisor = req.user.id;
    const { receptor } = req.body;

    // Evitar duplicados
    const [existe] = await db.query(
      `SELECT * FROM solicitudes_amistad 
       WHERE emisor_id = ? AND receptor_id = ? AND estado = 'pendiente'`,
      [emisor, receptor]
    );

    if (existe.length > 0) {
      return res.status(400).json({ msg: "Solicitud ya enviada" });
    }

    await db.query(
      `INSERT INTO solicitudes_amistad (emisor_id, receptor_id) VALUES (?, ?)`,
      [emisor, receptor]
    );

    res.json({ ok: true, msg: "Solicitud enviada" });
  } catch (err) {
    next(err);
  }
};

/**
 * Obtener solicitudes pendientes
 */
export const obtenerSolicitudesPendientes = async (req, res, next) => {
  try {
    const user = req.user.id;

    const [rows] = await db.query(
      `SELECT s.id, u.nombre AS emisor, u.id AS emisor_id, u.avatar
       FROM solicitudes_amistad s
       JOIN usuarios u ON u.id = s.emisor_id
       WHERE s.receptor_id = ? AND s.estado = 'pendiente'`,
      [user]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Aceptar solicitud
 */
export const aceptarSolicitud = async (req, res, next) => {
  try {
    const { id } = req.body;

    await db.query(
      `UPDATE solicitudes_amistad SET estado = 'aceptada' WHERE id = ?`,
      [id]
    );

    const [[sol]] = await db.query(
      `SELECT emisor_id, receptor_id FROM solicitudes_amistad WHERE id = ?`,
      [id]
    );

    // Crear seguimiento (estilo Instagram)
    await db.query(
      `INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)`,
      [sol.emisor_id, sol.receptor_id]
    );

    res.json({ ok: true, msg: "Solicitud aceptada" });
  } catch (err) {
    next(err);
  }
};

/**
 * Rechazar solicitud
 */
export const rechazarSolicitud = async (req, res, next) => {
  try {
    const { id } = req.body;

    await db.query(
      `UPDATE solicitudes_amistad SET estado = 'rechazada' WHERE id = ?`,
      [id]
    );

    res.json({ ok: true, msg: "Solicitud rechazada" });
  } catch (err) {
    next(err);
  }
};
