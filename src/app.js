// app.js
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes.js';
import {usuariosRoutes} from './routes/usuarios.routes.js';
import { PORT, CORS_ORIGIN } from './config/config.js';

const app = express();

const corsOptions = {
    origin: CORS_ORIGIN || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'API REST Bookverse con Express.js',
        version: '1.0.0',
        status: 'OK'
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});