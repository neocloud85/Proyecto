// controllers/reviewController.js
const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Crear una nueva reseña
 * POST /api/reviews
 */
exports.createReview = async (req, res, next) => {
  try {
    const { libro_id, texto, puntuacion } = req.body;
    const usuario_id = req.userId;

    // Validaciones
    if (!libro_id || !texto || !puntuacion) {
      throw new AppError('Libro, texto y puntuación son obligatorios', 400);
    }

    if (puntuacion < 1 || puntuacion > 5) {
      throw new AppError('La puntuación debe estar entre 1 y 5', 400);
    }

    // Verificar que el libro existe
    const [books] = await db.query('SELECT id FROM libros WHERE id = ?', [libro_id]);
    if (books.length === 0) {
      throw new AppError('Libro no encontrado', 404);
    }

    // Verificar que el usuario no haya reseñado ya este libro
    const [existing] = await db.query(
      'SELECT id FROM resenas WHERE usuario_id = ? AND libro_id = ?',
      [usuario_id, libro_id]
    );

    if (existing.length > 0) {
      throw new AppError('Ya has reseñado este libro', 409);
    }

    // Crear reseña
    const [result] = await db.query(
      'INSERT INTO resenas (libro_id, usuario_id, texto, puntuacion) VALUES (?, ?, ?, ?)',
      [libro_id, usuario_id, texto, puntuacion]
    );

    // Obtener la reseña creada con información del usuario
    const [newReview] = await db.query(
      `SELECT r.*, u.nombre as usuario_nombre, u.avatar as usuario_avatar, 
              l.titulo as libro_titulo, l.autor as libro_autor
       FROM resenas r
       INNER JOIN usuarios u ON r.usuario_id = u.id
       INNER JOIN libros l ON r.libro_id = l.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Reseña creada exitosamente',
      data: newReview[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener reseñas de un libro
 * GET /api/reviews/book/:bookId
 */
exports.getReviewsByBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'fecha';
    const offset = (page - 1) * limit;

    // Validar campo de ordenamiento
    const validSortFields = ['fecha', 'puntuacion', 'likes'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'fecha';

    const [reviews] = await db.query(
      `SELECT r.*, u.nombre as usuario_nombre, u.avatar as usuario_avatar
       FROM resenas r
       INNER JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.libro_id = ?
       ORDER BY ${sortField} DESC
       LIMIT ? OFFSET ?`,
      [bookId, limit, offset]
    );

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM resenas WHERE libro_id = ?',
      [bookId]
    );

    res.json({
      status: 'success',
      data: reviews,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener reseñas de un usuario
 * GET /api/reviews/user/:userId
 */
exports.getReviewsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [reviews] = await db.query(
      `SELECT r.*, l.titulo as libro_titulo, l.autor as libro_autor, l.imagen as libro_imagen
       FROM resenas r
       INNER JOIN libros l ON r.libro_id = l.id
       WHERE r.usuario_id = ?
       ORDER BY r.fecha DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM resenas WHERE usuario_id = ?',
      [userId]
    );

    res.json({
      status: 'success',
      data: reviews,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar una reseña
 * PUT /api/reviews/:id
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { texto, puntuacion } = req.body;
    const usuario_id = req.userId;

    // Verificar que la reseña existe y pertenece al usuario
    const [reviews] = await db.query(
      'SELECT * FROM resenas WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (reviews.length === 0) {
      throw new AppError('Reseña no encontrada o no tienes permiso para editarla', 404);
    }

    // Validar puntuación si se proporciona
    if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
      throw new AppError('La puntuación debe estar entre 1 y 5', 400);
    }

    // Construir query de actualización
    const updates = [];
    const values = [];

    if (texto) {
      updates.push('texto = ?');
      values.push(texto);
    }
    if (puntuacion) {
      updates.push('puntuacion = ?');
      values.push(puntuacion);
    }

    if (updates.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    updates.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    values.push(id);

    await db.query(
      `UPDATE resenas SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Obtener reseña actualizada
    const [updated] = await db.query(
      `SELECT r.*, u.nombre as usuario_nombre, u.avatar as usuario_avatar
       FROM resenas r
       INNER JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    res.json({
      status: 'success',
      message: 'Reseña actualizada exitosamente',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar una reseña
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario_id = req.userId;

    const [result] = await db.query(
      'DELETE FROM resenas WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (result.affectedRows === 0) {
      throw new AppError('Reseña no encontrada o no tienes permiso para eliminarla', 404);
    }

    res.json({
      status: 'success',
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dar o quitar like a una reseña
 * POST /api/reviews/:id/like
 */
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario_id = req.userId;

    // Verificar que la reseña existe
    const [reviews] = await db.query('SELECT id FROM resenas WHERE id = ?', [id]);
    if (reviews.length === 0) {
      throw new AppError('Reseña no encontrada', 404);
    }

    // Verificar si ya dio like
    const [existingLike] = await db.query(
      'SELECT * FROM likes_resenas WHERE usuario_id = ? AND resena_id = ?',
      [usuario_id, id]
    );

    if (existingLike.length > 0) {
      // Quitar like
      await db.query(
        'DELETE FROM likes_resenas WHERE usuario_id = ? AND resena_id = ?',
        [usuario_id, id]
      );

      res.json({
        status: 'success',
        message: 'Like eliminado',
        liked: false
      });
    } else {
      // Dar like
      await db.query(
        'INSERT INTO likes_resenas (usuario_id, resena_id) VALUES (?, ?)',
        [usuario_id, id]
      );

      res.json({
        status: 'success',
        message: 'Like agregado',
        liked: true
      });
    }
  } catch (error) {
    next(error);
  }
};