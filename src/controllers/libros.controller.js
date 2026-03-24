// controllers/bookController.js
const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Obtener todos los libros con paginación y búsqueda
 * GET /api/books
 */
exports.getAllBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'fecha_creacion';
    const sortOrder = req.query.sortOrder || 'DESC';
    
    const offset = (page - 1) * limit;

    // Query base
    let query = 'SELECT * FROM libros';
    let countQuery = 'SELECT COUNT(*) as total FROM libros';
    let queryParams = [];

    // Búsqueda
    if (search) {
      query += ' WHERE titulo LIKE ? OR autor LIKE ?';
      countQuery += ' WHERE titulo LIKE ? OR autor LIKE ?';
      queryParams = [`%${search}%`, `%${search}%`];
    }

    // Ordenamiento
    const validSortFields = ['titulo', 'autor', 'puntuacion_promedio', 'total_resenas', 'fecha_creacion'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'fecha_creacion';
    const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortField} ${sortDir}`;

    // Paginación
    query += ' LIMIT ? OFFSET ?';

    // Ejecutar queries
    const [books] = await db.query(query, [...queryParams, limit, offset]);
    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult[0].total;

    res.json({
      status: 'success',
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un libro por ID
 * GET /api/books/:id
 */
exports.getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener libro
    const [books] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);

    if (books.length === 0) {
      throw new AppError('Libro no encontrado', 404);
    }

    // Obtener etiquetas del libro
    const [tags] = await db.query(
      `SELECT e.* FROM etiquetas e
       INNER JOIN libro_etiquetas le ON e.id = le.etiqueta_id
       WHERE le.libro_id = ?`,
      [id]
    );

    // Obtener reseñas del libro (limitadas)
    const [reviews] = await db.query(
      `SELECT r.*, u.nombre as usuario_nombre, u.avatar as usuario_avatar
       FROM resenas r
       INNER JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.libro_id = ?
       ORDER BY r.fecha DESC
       LIMIT 5`,
      [id]
    );

    const book = {
      ...books[0],
      etiquetas: tags,
      resenas_recientes: reviews
    };

    res.json({
      status: 'success',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo libro
 * POST /api/books
 */
exports.createBook = async (req, res, next) => {
  try {
    const { titulo, autor, descripcion, isbn, fechaPublicacion, imagen, enlaceCompra } = req.body;

    // Validaciones
    if (!titulo || !autor || !descripcion) {
      throw new AppError('Título, autor y descripción son obligatorios', 400);
    }

    // Verificar ISBN duplicado
    if (isbn) {
      const [existing] = await db.query('SELECT id FROM libros WHERE isbn = ?', [isbn]);
      if (existing.length > 0) {
        throw new AppError('Ya existe un libro con ese ISBN', 409);
      }
    }

    // Insertar libro
    const [result] = await db.query(
      `INSERT INTO libros (titulo, autor, descripcion, isbn, fecha_publicacion, imagen, enlace_compra)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, autor, descripcion, isbn || null, fechaPublicacion || null, imagen || null, enlaceCompra || null]
    );

    // Obtener el libro creado
    const [newBook] = await db.query('SELECT * FROM libros WHERE id = ?', [result.insertId]);

    res.status(201).json({
      status: 'success',
      message: 'Libro creado exitosamente',
      data: newBook[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un libro
 * PUT /api/books/:id
 */
exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, autor, descripcion, imagen, enlaceCompra } = req.body;

    // Verificar que el libro existe
    const [books] = await db.query('SELECT id FROM libros WHERE id = ?', [id]);
    if (books.length === 0) {
      throw new AppError('Libro no encontrado', 404);
    }

    // Construir query de actualización dinámica
    const updates = [];
    const values = [];

    if (titulo) {
      updates.push('titulo = ?');
      values.push(titulo);
    }
    if (autor) {
      updates.push('autor = ?');
      values.push(autor);
    }
    if (descripcion) {
      updates.push('descripcion = ?');
      values.push(descripcion);
    }
    if (imagen !== undefined) {
      updates.push('imagen = ?');
      values.push(imagen);
    }
    if (enlaceCompra !== undefined) {
      updates.push('enlace_compra = ?');
      values.push(enlaceCompra);
    }

    if (updates.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    values.push(id);

    // Actualizar
    await db.query(
      `UPDATE libros SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Obtener libro actualizado
    const [updatedBook] = await db.query('SELECT * FROM libros WHERE id = ?', [id]);

    res.json({
      status: 'success',
      message: 'Libro actualizado exitosamente',
      data: updatedBook[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un libro
 * DELETE /api/books/:id
 */
exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM libros WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new AppError('Libro no encontrado', 404);
    }

    res.json({
      status: 'success',
      message: 'Libro eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener libros mejor valorados
 * GET /api/books/top-rated
 */
exports.getTopRatedBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [books] = await db.query(
      `SELECT * FROM libros 
       WHERE total_resenas >= 5
       ORDER BY puntuacion_promedio DESC, total_resenas DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      status: 'success',
      data: books
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener libros por etiqueta
 * GET /api/books/tag/:tagId
 */
exports.getBooksByTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [books] = await db.query(
      `SELECT l.* FROM libros l
       INNER JOIN libro_etiquetas le ON l.id = le.libro_id
       WHERE le.etiqueta_id = ?
       ORDER BY l.fecha_creacion DESC
       LIMIT ? OFFSET ?`,
      [tagId, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM libro_etiquetas WHERE etiqueta_id = ?`,
      [tagId]
    );

    res.json({
      status: 'success',
      data: books,
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