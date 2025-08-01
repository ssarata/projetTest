import express, { Application } from 'express';
import authRouter from './src/Routes/auth.route';
import mairieRouter from './src/Routes/mairie.route';
import setupSwagger from './utils/swagger';
import path from 'path';
import dotenv from 'dotenv';
import personneRouter from './src/Routes/personne.route';
import variableRoutes from './src/Routes/Variable.route';
import routesTemplates from './src/Routes/DocumentTemplate.route';
import documentRoutes from './src/Routes/Document.route';
import documentPersonneRoutes from './src/Routes/DocumentPersonne.route';
import cors from 'cors';
dotenv.config();

const app: Application = express();

// Middleware pour parser JSON dans le body des requêtes
app.use(express.json());

// Middleware CORS - autorise le front http://localhost:4000
app.use(cors({
  origin: 'http://localhost:4000',
  credentials: true,
}));

// Configuration Swagger
setupSwagger(app);

// Fichiers statiques
app.use('/api/mairies/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Définition des routes
app.use('/auth', authRouter);
app.use('/api/variables', variableRoutes);
app.use('/api/templates', routesTemplates);
app.use('/api/documents', documentRoutes);
app.use('/api/personnes', personneRouter);
app.use('/api/document-personnes', documentPersonneRoutes);
app.use('/api/mairies', mairieRouter);

const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs: http://localhost:${PORT}/api-docs`);
});
