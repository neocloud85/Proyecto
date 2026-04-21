-- ============================================
-- BOOKVERSE - Base de Datos MySQL
-- Sistema de valoración y reseñas de libros
-- ============================================

-- Crear base de datos
DROP DATABASE IF EXISTS bookverse;
CREATE DATABASE bookverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bookverse;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    tipo ENUM('admin', 'moderador', 'usuario') DEFAULT 'usuario',
    bio TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_correo (correo),
    INDEX idx_tipo (tipo),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: libros
-- ============================================
CREATE TABLE libros (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    isbn VARCHAR(20) UNIQUE DEFAULT NULL,
    fecha_publicacion YEAR DEFAULT NULL,
    imagen VARCHAR(500) DEFAULT NULL,
    puntuacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_resenas INT UNSIGNED DEFAULT 0,
    enlace_compra TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_titulo (titulo),
    INDEX idx_autor (autor),
    INDEX idx_isbn (isbn),
    INDEX idx_puntuacion (puntuacion_promedio),
    FULLTEXT idx_busqueda (titulo, autor, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: etiquetas
-- ============================================
CREATE TABLE etiquetas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    aprobada BOOLEAN DEFAULT FALSE,
    propuesta_por CHAR(36) DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (propuesta_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_nombre (nombre),
    INDEX idx_aprobada (aprobada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: listas (listas de lectura de usuarios)
-- ============================================
CREATE TABLE listas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    publica BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_publica (publica)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: resenas
-- ============================================
CREATE TABLE resenas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    libro_id CHAR(36) NOT NULL,
    usuario_id CHAR(36) NOT NULL,
    texto TEXT NOT NULL,
    puntuacion TINYINT UNSIGNED NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    likes INT UNSIGNED DEFAULT 0,
    
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Un usuario solo puede hacer una reseña por libro
    UNIQUE KEY unique_user_book_review (usuario_id, libro_id),
    
    INDEX idx_libro (libro_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_puntuacion (puntuacion),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: mensajes
-- ============================================
CREATE TABLE mensajes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    remitente_id CHAR(36) NOT NULL,
    destinatario_id CHAR(36) NOT NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    INDEX idx_remitente (remitente_id),
    INDEX idx_destinatario (destinatario_id),
    INDEX idx_leido (leido),
    INDEX idx_fecha_envio (fecha_envio),
    INDEX idx_conversacion (remitente_id, destinatario_id, fecha_envio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: seguidores (relación N:M usuarios)
-- ============================================
CREATE TABLE seguidores (
    seguidor_id CHAR(36) NOT NULL,
    seguido_id CHAR(36) NOT NULL,
    fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (seguidor_id, seguido_id),
    FOREIGN KEY (seguidor_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (seguido_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Evitar que un usuario se siga a sí mismo
    CHECK (seguidor_id != seguido_id),
    
    INDEX idx_seguidor (seguidor_id),
    INDEX idx_seguido (seguido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: libro_etiquetas (relación N:M)
-- ============================================
CREATE TABLE libro_etiquetas (
    libro_id CHAR(36) NOT NULL,
    etiqueta_id CHAR(36) NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (libro_id, etiqueta_id),
    FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE,
    
    INDEX idx_libro (libro_id),
    INDEX idx_etiqueta (etiqueta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: lista_resenas (relación N:M)
-- ============================================
CREATE TABLE lista_resenas (
    lista_id CHAR(36) NOT NULL,
    resena_id CHAR(36) NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (lista_id, resena_id),
    FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE CASCADE,
    FOREIGN KEY (resena_id) REFERENCES resenas(id) ON DELETE CASCADE,
    
    INDEX idx_lista (lista_id),
    INDEX idx_resena (resena_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: likes_resenas (usuarios que dieron like a reseñas)
-- ============================================
CREATE TABLE likes_resenas (
    usuario_id CHAR(36) NOT NULL,
    resena_id CHAR(36) NOT NULL,
    fecha_like TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (usuario_id, resena_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (resena_id) REFERENCES resenas(id) ON DELETE CASCADE,
    
    INDEX idx_usuario (usuario_id),
    INDEX idx_resena (resena_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Actualizar puntuación promedio del libro cuando se crea una reseña
DELIMITER //
CREATE TRIGGER after_resena_insert
AFTER INSERT ON resenas
FOR EACH ROW
BEGIN
    UPDATE libros
    SET puntuacion_promedio = (
            SELECT AVG(puntuacion)
            FROM resenas
            WHERE libro_id = NEW.libro_id
        ),
        total_resenas = (
            SELECT COUNT(*)
            FROM resenas
            WHERE libro_id = NEW.libro_id
        )
    WHERE id = NEW.libro_id;
END//
DELIMITER ;

-- Trigger: Actualizar puntuación promedio del libro cuando se actualiza una reseña
DELIMITER //
CREATE TRIGGER after_resena_update
AFTER UPDATE ON resenas
FOR EACH ROW
BEGIN
    UPDATE libros
    SET puntuacion_promedio = (
            SELECT AVG(puntuacion)
            FROM resenas
            WHERE libro_id = NEW.libro_id
        ),
        total_resenas = (
            SELECT COUNT(*)
            FROM resenas
            WHERE libro_id = NEW.libro_id
        )
    WHERE id = NEW.libro_id;
END//
DELIMITER ;

-- Trigger: Actualizar puntuación promedio del libro cuando se elimina una reseña
DELIMITER //
CREATE TRIGGER after_resena_delete
AFTER DELETE ON resenas
FOR EACH ROW
BEGIN
    UPDATE libros
    SET puntuacion_promedio = COALESCE((
            SELECT AVG(puntuacion)
            FROM resenas
            WHERE libro_id = OLD.libro_id
        ), 0),
        total_resenas = (
            SELECT COUNT(*)
            FROM resenas
            WHERE libro_id = OLD.libro_id
        )
    WHERE id = OLD.libro_id;
END//
DELIMITER ;

-- Trigger: Incrementar contador de likes en reseña
DELIMITER //
CREATE TRIGGER after_like_insert
AFTER INSERT ON likes_resenas
FOR EACH ROW
BEGIN
    UPDATE resenas
    SET likes = likes + 1
    WHERE id = NEW.resena_id;
END//
DELIMITER ;

-- Trigger: Decrementar contador de likes en reseña
DELIMITER //
CREATE TRIGGER after_like_delete
AFTER DELETE ON likes_resenas
FOR EACH ROW
BEGIN
    UPDATE resenas
    SET likes = likes - 1
    WHERE id = OLD.resena_id;
END//
DELIMITER ;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Libros más valorados
CREATE VIEW libros_top_rated AS
SELECT 
    l.*,
    COUNT(r.id) as cantidad_resenas
FROM libros l
LEFT JOIN resenas r ON l.id = r.libro_id
WHERE l.total_resenas >= 5
GROUP BY l.id
ORDER BY l.puntuacion_promedio DESC, l.total_resenas DESC
LIMIT 100;

-- Vista: Usuarios más activos
CREATE VIEW usuarios_activos AS
SELECT 
    u.id,
    u.nombre,
    u.avatar,
    COUNT(DISTINCT r.id) as total_resenas,
    COUNT(DISTINCT s.seguido_id) as siguiendo,
    COUNT(DISTINCT seg.seguidor_id) as seguidores
FROM usuarios u
LEFT JOIN resenas r ON u.id = r.usuario_id
LEFT JOIN seguidores s ON u.id = s.seguidor_id
LEFT JOIN seguidores seg ON u.id = seg.seguido_id
GROUP BY u.id
ORDER BY total_resenas DESC;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar usuarios de prueba
INSERT INTO usuarios (id, nombre, correo, contrasena, tipo, bio) VALUES
(UUID(), 'Rafa', 'neocloud85@g,ail.com', '1234', 'admin', 'Administrador del sistema'),
(UUID(), 'Admin Bookverse', 'admin@bookverse.com', '$2b$10$XYZ', 'admin', 'Administrador del sistema'),
(UUID(), 'María García', 'maria@example.com', '$2b$10$ABC', 'usuario', 'Amante de la fantasía y ciencia ficción'),
(UUID(), 'Juan Pérez', 'juan@example.com', '$2b$10$DEF', 'usuario', 'Leo de todo, especialmente novela histórica');

-- Insertar etiquetas predefinidas
INSERT INTO etiquetas (id, nombre, aprobada) VALUES
(UUID(), 'Fantasía', TRUE),
(UUID(), 'Ciencia Ficción', TRUE),
(UUID(), 'Romance', TRUE),
(UUID(), 'Thriller', TRUE),
(UUID(), 'Terror', TRUE),
(UUID(), 'Histórica', TRUE),
(UUID(), 'Biografía', TRUE),
(UUID(), 'Autoayuda', TRUE),
(UUID(), 'Juvenil', TRUE),
(UUID(), 'Clásico', TRUE);

-- Insertar libros de ejemplo
INSERT INTO libros (id, titulo, autor, descripcion, isbn, fecha_publicacion, puntuacion_promedio, total_resenas) VALUES
(UUID(), 'Cien años de soledad', 'Gabriel García Márquez', 'Una obra maestra del realismo mágico que narra la historia de la familia Buendía.', '9780060883287', 1967, 4.5, 0),
(UUID(), '1984', 'George Orwell', 'Una distopía sobre un régimen totalitario que controla cada aspecto de la vida.', '9780451524935', 1949, 4.7, 0),
(UUID(), 'El principito', 'Antoine de Saint-Exupéry', 'Un cuento poético que trata temas profundos sobre el amor y la amistad.', '9780156012195', 1943, 4.8, 0);

-- ============================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

-- Índice compuesto para búsquedas de reseñas por libro y usuario
CREATE INDEX idx_resenas_libro_usuario ON resenas(libro_id, usuario_id);

-- Índice para ordenar libros por popularidad
CREATE INDEX idx_libros_popularidad ON libros(total_resenas DESC, puntuacion_promedio DESC);

-- Índice para mensajes no leídos por usuario
CREATE INDEX idx_mensajes_no_leidos ON mensajes(destinatario_id, leido, fecha_envio DESC);