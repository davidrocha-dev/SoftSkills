require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const gestorRoutes = require('./routes/gestorRoutes');
const areaRoutes = require('./routes/areaRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const topicRoutes = require('./routes/topicRoutes');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const formadorRoutes = require('./routes/formadorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const imageRoutes = require('./routes/imageRoutes');
const forumRoutes = require ('./routes/forumRoutes')
const uploadRoutes = require('./routes/uploadRoutes');
const resourceTypeRoutes = require('./routes/resourceTypeRoutes');
const seed = require('./seed');
const { sequelize } = require('./models');

const cron = require('node-cron');
const { Op } = require('sequelize');
const { Course } = require('./models');

const app = express();

// Configuração de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5173/'],
  credentials: false
}));

// Middleware para parsear JSON
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Registro das rotas
app.use('/api/auth', authRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/topicos', topicRoutes);
app.use('/api/cursos', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/formador', formadorRoutes);
app.use('/api/gestor', gestorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resource-types', resourceTypeRoutes);
app.use('/api/forum', forumRoutes);


app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      details: err.message,
      stack: err.stack 
    })
  });
});

async function updateCourseStatus() {
  try {
    // 1) Normaliza datas
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 2) SÍNCRONOS
    // 2.1) Já acabou (endDate < tomorrow)
    const [endedSync] = await Course.update(
      { status: false, visible: true, inscricoes: false },
      {
        where: {
          courseType: true,
          endDate: { [Op.lt]: tomorrow }
        }
      }
    );
    console.log('🔔 [Sync Ended] rows:', endedSync);

    // 2.2) Em curso (startDate < tomorrow AND endDate >= tomorrow)
    const [ongoingSync] = await Course.update(
      { status: true, visible: true, inscricoes: false },
      {
        where: {
          courseType: true,
          startDate: { [Op.lt]: tomorrow },
          endDate:   { [Op.gte]: tomorrow }
        }
      }
    );
    console.log('🔔 [Sync Ongoing] rows:', ongoingSync);

    // 2.3) Futuro (startDate >= tomorrow)
    const [futureSync] = await Course.update(
      { status: false, visible: true, inscricoes: true },
      {
        where: {
          courseType: true,
          startDate: { [Op.gte]: tomorrow }
        }
      }
    );
    console.log('🔔 [Sync Future] rows:', futureSync);

    // 3) ASSÍNCRONOS
    const [endedAsync] = await Course.update(
      { status: false, visible: false, inscricoes: false },
      {
        where: {
          courseType: false,
          endDate: { [Op.lt]: tomorrow }
        }
      }
    );
    console.log('🔔 [Async Ended] rows:', endedAsync);

    const [ongoingAsync] = await Course.update(
      { status: true, visible: true, inscricoes: true },
      {
        where: {
          courseType: false,
          startDate: { [Op.lt]: tomorrow },
          endDate:   { [Op.gte]: tomorrow }
        }
      }
    );
    console.log('🔔 [Async Ongoing] rows:', ongoingAsync);

    const [futureAsync] = await Course.update(
      { status: false, visible: true, inscricoes: true },
      {
        where: {
          courseType: false,
          startDate: { [Op.gte]: tomorrow }
        }
      }
    );
    console.log('🔔 [Async Future] rows:', futureAsync);

  } catch (error) {
    console.error('Erro ao atualizar status dos cursos:', error);
  }
}


sequelize.authenticate({alter: true})
  .then(() => {
    return sequelize.sync();
  })
  .then(() => {
    
    // Agendador para atualizar status dos cursos a cada minuto
    cron.schedule('* * * * *', async () => {
      await updateCourseStatus();
    });
    
    // Executar imediatamente ao iniciar o servidor
    updateCourseStatus();
  })
  .catch(err => {
    console.error('Erro ao conectar/sincronizar:', err);
    process.exit(1);
  });

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});