const { sequelize } = require('./models');
const {
  User,
  Category,
  Area,
  Topic,
  Course,
  Section,
  ResourceType,
  Resource,
  Certificate,
  Enrollment,
  Notification,
  Interest,
  Comment,
  Reaction,
  Report
} = require('./models');

async function clearDatabase() {
  try {
    // Nova abordagem sem session_replication_role
    // Lista de modelos em ordem inversa de dependência
    const models = [
      Report, Reaction, Comment, Interest, Notification,
      Enrollment, Certificate, Resource, Section,
      Course, Topic, Area, Category, User, ResourceType
    ];

    // Deleta registros em cascata
    for (const model of models) {
      await model.destroy({
        where: {},
        truncate: true,
        cascade: true,
        force: true,
        restartIdentity: true
      });
      console.log(`Tabela ${model.name} limpa!`);
    }
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    // Limpa dados existentes
    await clearDatabase();

    // Cria usuários
    const users = await User.bulkCreate([
      { workerNumber: 'U001', name: 'Admin', primaryRole: 'gestor', email: 'admin@softinsa.pt', password: '$2a$10$fYg3/WdKs3bZBt/kq09YpON2wULR9Csd/hDz9YBtunqaYoWF8KR1e', status: true },
      { workerNumber: 'U002', name: 'Formador', primaryRole: 'formador', email: 'formador@softinsa.pt', password: '$2a$10$4XQ0UOzS22Woa0slPEin8.3qK0T6T0IqQl6YvDRJSy8ZbP10RQ3ue', status: true },
      { workerNumber: 'U003', name: 'Formando', primaryRole: 'formando', email: 'formando@softinsa.pt', password: '$2a$10$jX7yGbV/TXLxFkl4fQqW/ONztwHDMWWe/P.Wa0UsqcMdFktjG/vdO', status: true }
    ]);
    console.log('Usuários criados!');

    // Cria categorias
    const categories = await Category.bulkCreate([
      { description: 'Tecnologia' },
      { description: 'Comunicação' },
      { description: 'Gestão' },
      { description: 'Marketing' },
      { description: 'Design' }
    ], { validate: true }); // Forçar validação
    console.log('Categorias criadas!');

    // Cria tipos de recurso
    const resourceTypes = await ResourceType.bulkCreate([
      { type: 1, name: 'Documento', icon: 'Documento' },
      { type: 2, name: 'Video', icon: 'Video' },
      { type: 3, name: 'Link', icon: 'Link' },
      { type: 4, name: 'Grafico', icon: 'Grafico' },
      { type: 5, name: 'Audio', icon: 'Audio' }
    ]);
    console.log('Tipos de recurso criados!');

    // Mapeia descrição para ID
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.description] = cat.id;
    });

    // Cria áreas usando os IDs reais
const areas = await Area.bulkCreate([
  { description: 'Programação', categoryId: categories[0].id },
  { description: 'Redes Sociais', categoryId: categories[1].id },
  { description: 'Liderança', categoryId: categories[2].id },
  { description: 'SEO', categoryId: categories[3].id },
  { description: 'UX Design', categoryId: categories[4].id },
  { description: 'DevOps', categoryId: categories[0].id },
  { description: 'Apresentações', categoryId: categories[1].id },
  { description: 'Planeamento', categoryId: categories[2].id },
  { description: 'Publicidade', categoryId: categories[3].id },
  { description: 'Ilustração', categoryId: categories[4].id }
]);

    // Cria tópicos
    const topics = await Topic.bulkCreate([
      { description: 'JavaScript', areaId: 1 },
      { description: 'Instagram Pro', areaId: 2 },
      { description: 'Gestão de Equipas', areaId: 3 },
      { description: 'Google Ranking', areaId: 4 },
      { description: 'Design de Interfaces', areaId: 5 },
      { description: 'Containers Docker', areaId: 6 },
      { description: 'Storytelling', areaId: 7 },
      { description: 'Scrum', areaId: 8 },
      { description: 'Facebook Ads', areaId: 9 },
      { description: 'Desenho Vetorial', areaId: 10 }
    ]);
    console.log('Tópicos criados!');

    // Cria cursos
    const courses = await Course.bulkCreate([
      { title: 'Curso A', courseType: false, description: 'Desc A', instructor: 'U002', topicId: 1, level: 'Básico', startDate: '2025-04-01', endDate: '2025-04-10', hours: 10, vacancies: 30, status: true },
      { title: 'Curso B', courseType: true, description: 'Desc B', instructor: 'U003', topicId: 2, level: 'Intermédio', startDate: '2025-04-02', endDate: '2025-04-12', hours: 12, vacancies: 0, status: true },
      { title: 'Curso C', courseType: false, description: 'Desc C', instructor: 'U002', topicId: 3, level: 'Avançado', startDate: '2025-04-03', endDate: '2025-04-13', hours: 15, vacancies: 20, status: true },
      { title: 'Curso D', courseType: true, description: 'Desc D', instructor: 'U003', topicId: 4, level: 'Básico', startDate: '2025-04-04', endDate: '2025-04-14', hours: 8, vacancies: 0, status: true },
      { title: 'Curso E', courseType: false, description: 'Desc E', instructor: 'U002', topicId: 5, level: 'Intermédio', startDate: '2025-04-05', endDate: '2025-04-15', hours: 10, vacancies: 10, status: true },
      { title: 'Curso F', courseType: true, description: 'Desc F', instructor: 'U003', topicId: 6, level: 'Avançado', startDate: '2025-04-06', endDate: '2025-04-16', hours: 11, vacancies: 0, status: true },
      { title: 'Curso G', courseType: false, description: 'Desc G', instructor: 'U002', topicId: 7, level: 'Básico', startDate: '2025-04-07', endDate: '2025-04-17', hours: 9, vacancies: 5, status: true },
      { title: 'Curso H', courseType: true, description: 'Desc H', instructor: 'U003', topicId: 8, level: 'Intermédio', startDate: '2025-04-08', endDate: '2025-04-18', hours: 6, vacancies: 0, status: true },
      { title: 'Curso I', courseType: false, description: 'Desc I', instructor: 'U002', topicId: 9, level: 'Avançado', startDate: '2025-04-09', endDate: '2025-04-19', hours: 7, vacancies: 25, status: true },
      { title: 'Curso J', courseType: true, description: 'Desc J', instructor: 'U003', topicId: 10, level: 'Básico', startDate: '2025-04-10', endDate: '2025-04-20', hours: 10, vacancies: 0, status: true }
    ]);
    console.log('Cursos criados!');

    // Cria seções
    const sections = await Section.bulkCreate([
      { courseId: 1, title: 'Introdução', order: 1, status: true },
      { courseId: 2, title: 'Módulo 1', order: 1, status: true },
      { courseId: 3, title: 'Sessão Inicial', order: 1, status: true },
      { courseId: 4, title: 'Conceitos Básicos', order: 1, status: true },
      { courseId: 5, title: 'Apresentação', order: 1, status: true },
      { courseId: 6, title: 'Contexto', order: 1, status: true },
      { courseId: 7, title: 'Introdução', order: 1, status: true },
      { courseId: 8, title: 'Técnicas', order: 1, status: true },
      { courseId: 9, title: 'Revisão', order: 1, status: true },
      { courseId: 10, title: 'Fecho', order: 1, status: true }
    ]);
    console.log('Seções criadas!');

    // Cria recursos
    const resources = await Resource.bulkCreate([
      { sectionId: 1, typeId: 1, title: 'PDF Introdução', text: 'Conteúdo PDF', file: 'intro.pdf', link: null },
      { sectionId: 2, typeId: 2, title: 'Vídeo Módulo 1', text: null, file: null, link: 'https://youtube.com/mod1' },
      { sectionId: 3, typeId: 3, title: 'Artigo externo', text: null, file: null, link: 'https://blog.com/artigo' },
      { sectionId: 4, typeId: 4, title: 'Slides conceitos', text: null, file: 'conceitos.pptx', link: null },
      { sectionId: 5, typeId: 1, title: 'PDF Apresentação', text: 'Apresentação inicial', file: 'apresentacao.pdf', link: null },
      { sectionId: 6, typeId: 2, title: 'Vídeo explicativo', text: null, file: null, link: 'https://youtube.com/explica' },
      { sectionId: 7, typeId: 3, title: 'Recurso web', text: null, file: null, link: 'https://site.com' },
      { sectionId: 8, typeId: 4, title: 'Infográfico', text: null, file: 'info.jpg', link: null },
      { sectionId: 9, typeId: 5, title: 'Podcast', text: null, file: 'podcast.mp3', link: null },
      { sectionId: 10, typeId: 1, title: 'Resumo final', text: 'Resumo de conceitos', file: 'resumo.pdf', link: null }
    ]);
    console.log('Recursos criados!');

    // Cria certificados
    const certificates = await Certificate.bulkCreate([
      { courseId: 1, workerNumber: 'U001', grade: 90, observation: 'Bom' },
      { courseId: 2, workerNumber: 'U002', grade: 88, observation: 'Muito bom' },
      { courseId: 3, workerNumber: 'U001', grade: 85, observation: 'Satisfatório' },
      { courseId: 4, workerNumber: 'U002', grade: 92, observation: 'Excelente' },
      { courseId: 5, workerNumber: 'U001', grade: 80, observation: 'Aceitável' },
      { courseId: 6, workerNumber: 'U002', grade: 89, observation: 'Bom' },
      { courseId: 7, workerNumber: 'U001', grade: 91, observation: 'Muito bom' },
      { courseId: 8, workerNumber: 'U002', grade: 87, observation: 'Regular' },
      { courseId: 9, workerNumber: 'U001', grade: 84, observation: 'Cumpriu' },
      { courseId: 10, workerNumber: 'U002', grade: 86, observation: 'Atingido' }
    ]);
    console.log('Certificados criados!');

    // Cria inscrições
    const enrollments = await Enrollment.bulkCreate([
      { courseId: 1, workerNumber: 'U001', enrollmentDate: '2025-04-01', status: 'Ativo', rating: 4.5 },
      { courseId: 2, workerNumber: 'U002', enrollmentDate: '2025-04-01', status: 'Ativo', rating: 4.7 },
      { courseId: 3, workerNumber: 'U001', enrollmentDate: '2025-04-02', status: 'Ativo', rating: 4.2 },
      { courseId: 4, workerNumber: 'U002', enrollmentDate: '2025-04-02', status: 'Ativo', rating: 4.8 },
      { courseId: 5, workerNumber: 'U001', enrollmentDate: '2025-04-03', status: 'Ativo', rating: 4.3 },
      { courseId: 6, workerNumber: 'U002', enrollmentDate: '2025-04-03', status: 'Ativo', rating: 4.4 },
      { courseId: 7, workerNumber: 'U001', enrollmentDate: '2025-04-04', status: 'Pendente', rating: null },
      { courseId: 8, workerNumber: 'U002', enrollmentDate: '2025-04-04', status: 'Ativo', rating: 4.6 },
      { courseId: 9, workerNumber: 'U001', enrollmentDate: '2025-04-05', status: 'Inativo', rating: null },
      { courseId: 10, workerNumber: 'U002', enrollmentDate: '2025-04-05', status: 'Ativo', rating: 4.9 }
    ]);
    console.log('Inscrições criadas!');

    // Cria notificações
    const notifications = await Notification.bulkCreate([
      { type: 'Info', message: 'Curso disponível', sendDate: '2025-04-01', workerNumber: 'U001', seen: false },
      { type: 'Alerta', message: 'Alteração de horário', sendDate: '2025-04-01', workerNumber: 'U002', seen: false },
      { type: 'Aviso', message: 'Novo recurso disponível', sendDate: '2025-04-02', workerNumber: 'U001', seen: false },
      { type: 'Info', message: 'Avaliação publicada', sendDate: '2025-04-03', workerNumber: 'U002', seen: false },
      { type: 'Info', message: 'Certificado disponível', sendDate: '2025-04-03', workerNumber: 'U001', seen: false },
      { type: 'Alerta', message: 'Mudança de sala', sendDate: '2025-04-04', workerNumber: 'U002', seen: false },
      { type: 'Info', message: 'Início de curso amanhã', sendDate: '2025-04-04', workerNumber: 'U001', seen: false },
      { type: 'Aviso', message: 'Quiz final desbloqueado', sendDate: '2025-04-05', workerNumber: 'U002', seen: false },
      { type: 'Info', message: 'Avaliação concluída', sendDate: '2025-04-06', workerNumber: 'U001', seen: false },
      { type: 'Alerta', message: 'Novo curso adicionado', sendDate: '2025-04-06', workerNumber: 'U002', seen: false }
    ]);
    console.log('Notificações criadas!');

    // Cria interesses
    const interests = await Interest.bulkCreate([
      { workerNumber: 'U001', categoryId: 1, areaId: 1, topicId: 1 },
      { workerNumber: 'U001', categoryId: 2, areaId: 2, topicId: 2 },
      { workerNumber: 'U002', categoryId: 3, areaId: 3, topicId: 3 },
      { workerNumber: 'U002', categoryId: 4, areaId: 4, topicId: 4 },
      { workerNumber: 'U001', categoryId: 5, areaId: 5, topicId: 5 },
      { workerNumber: 'U002', categoryId: 1, areaId: 6, topicId: 6 },
      { workerNumber: 'U001', categoryId: 2, areaId: 7, topicId: 7 },
      { workerNumber: 'U002', categoryId: 3, areaId: 8, topicId: 8 },
      { workerNumber: 'U001', categoryId: 4, areaId: 9, topicId: 9 },
      { workerNumber: 'U002', categoryId: 5, areaId: 10, topicId: 10 }
    ]);
    console.log('Interesses criados!');

    // Cria comentários
    const comments = await Comment.bulkCreate([
      { topicId: 1, workerNumber: 'U001', parentCommentId: null, commentDate: '2025-04-01', content: 'Muito bom!', status: true },
      { topicId: 2, workerNumber: 'U002', parentCommentId: null, commentDate: '2025-04-01', content: 'Gostei bastante', status: true },
      { topicId: 3, workerNumber: 'U001', parentCommentId: null, commentDate: '2025-04-02', content: 'Poderia ser mais claro', status: true },
      { topicId: 4, workerNumber: 'U002', parentCommentId: null, commentDate: '2025-04-02', content: 'Excelente explicação', status: true },
      { topicId: 5, workerNumber: 'U001', parentCommentId: null, commentDate: '2025-04-03', content: 'Relevante para o projeto', status: true },
      { topicId: 6, workerNumber: 'U002', parentCommentId: null, commentDate: '2025-04-03', content: 'Muito útil', status: true },
      { topicId: 7, workerNumber: 'U001', parentCommentId: null, commentDate: '2025-04-04', content: 'Top!', status: true },
      { topicId: 8, workerNumber: 'U002', parentCommentId: null, commentDate: '2025-04-04', content: 'Não gostei muito', status: true },
      { topicId: 9, workerNumber: 'U001', parentCommentId: null, commentDate: '2025-04-05', content: 'Boa abordagem', status: true },
      { topicId: 10, workerNumber: 'U002', parentCommentId: null, commentDate: '2025-04-05', content: 'Pode melhorar', status: true }
    ]);
    console.log('Comentários criados!');

    // Cria reações
    const reactions = await Reaction.bulkCreate([
      { workerNumber: 'U001', commentId: 1, type: true },
      { workerNumber: 'U002', commentId: 2, type: true },
      { workerNumber: 'U001', commentId: 3, type: false },
      { workerNumber: 'U002', commentId: 4, type: true },
      { workerNumber: 'U001', commentId: 5, type: true },
      { workerNumber: 'U002', commentId: 6, type: true },
      { workerNumber: 'U001', commentId: 7, type: false },
      { workerNumber: 'U002', commentId: 8, type: true },
      { workerNumber: 'U001', commentId: 9, type: true },
      { workerNumber: 'U002', commentId: 10, type: false }
    ]);
    console.log('Reações criadas!');

    // Cria denúncias
    const reports = await Report.bulkCreate([
      { commentId: 3, workerNumber: 'U002', reportDate: '2025-04-01', reason: 'Comentário ofensivo', status: false },
      { commentId: 4, workerNumber: 'U001', reportDate: '2025-04-01', reason: 'Spam', status: false },
      { commentId: 6, workerNumber: 'U002', reportDate: '2025-04-02', reason: 'Fora de contexto', status: false },
      { commentId: 7, workerNumber: 'U001', reportDate: '2025-04-02', reason: 'Informação incorreta', status: false },
      { commentId: 8, workerNumber: 'U002', reportDate: '2025-04-03', reason: 'Irrelevante', status: false },
      { commentId: 9, workerNumber: 'U001', reportDate: '2025-04-03', reason: 'Linguagem inadequada', status: false },
      { commentId: 2, workerNumber: 'U002', reportDate: '2025-04-04', reason: 'Não relacionado', status: false },
      { commentId: 5, workerNumber: 'U001', reportDate: '2025-04-04', reason: 'Duplicado', status: false },
      { commentId: 1, workerNumber: 'U002', reportDate: '2025-04-05', reason: 'Desnecessário', status: false },
      { commentId: 10, workerNumber: 'U001', reportDate: '2025-04-05', reason: 'Vago demais', status: false }
    ]);
    console.log('Denúncias criadas!');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } 
}

module.exports = {
  seedDatabase
};