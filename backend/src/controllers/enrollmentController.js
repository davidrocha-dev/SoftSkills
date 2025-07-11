// controllers/enrollmentController.js
const { Enrollment, Course, User } = require('../models');

exports.listEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      include: [
        { model: Course, as: 'course' },
        { model: User, as: 'user' }
      ]
    });
    // Filtrar apenas inscrições com usuário associado
    const filtered = enrollments.filter(e => e.user !== null);
    res.json(filtered);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.createEnrollment = async (req, res) => {
  const { courseId, userId } = req.body;
  console.log('Recebendo dados para inscrição:', { courseId, userId });

  try {
    // Verificar se os campos obrigatórios estão presentes
    if (!courseId || !userId) {
      return res.status(400).json({ error: 'Campos courseId e userId são obrigatórios' });
    }

    // Verificar se já existe inscrição para este user + curso
    const existing = await Enrollment.findOne({
      where: { courseId, userId }
    });
    if (existing) {
      return res.status(400).json({ error: 'Utilizador já inscrito neste curso' });
    }

    // Verificar se o curso existe
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    // Verificar se o usuário existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Criar inscrição
    const newEnrollment = await Enrollment.create({
      courseId,
      userId,
      enrollmentDate: new Date(),
      status: 'Pendente'
    });

    return res.status(201).json(newEnrollment);

  } catch (error) {
    console.error('❌ [createEnrollment] Erro ao criar inscrição:', error);
    return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};


exports.getEnrolledCoursesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Busca apenas os IDs dos cursos em que este user está inscrito
    const enrollments = await Enrollment.findAll({
      where: { userId },
      attributes: ['courseId']
    });

    const courseIds = enrollments.map(e => e.courseId);

    return res.json({
      success: true,
      courseIds
    });
  } catch (error) {
    console.error('[EnrollmentController] Erro em getEnrolledCoursesByUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar inscrições'
    });
  }
};

exports.getEnrollmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollments = await Enrollment.findAll({
      where: { courseId },
      include: [
        { model: User, as: 'user' }
      ]
    });
    // Filtrar apenas inscrições com usuário associado
    const filtered = enrollments.filter(e => e.user !== null);
    res.json(filtered);
  } catch (error) {
    console.error('Erro ao buscar inscrições do curso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    enrollment.status = status;
    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    await enrollment.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};