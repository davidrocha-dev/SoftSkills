exports.createSection = async (req, res) => {
  try {
    const { id } = req.params; 
    const { title, order, status } = req.body;
    if (!title || !order) {
      return res.status(400).json({ message: 'Título e ordem são obrigatórios' });
    }

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }

    const section = await Section.create({
      title,
      order,
      status: status !== undefined ? status : true,
      courseId: id
    });
    return res.status(201).json(section);
  } catch (error) {
    console.error('Erro ao criar seção:', error);
    return res.status(500).json({ message: 'Erro ao criar seção', error: error.message });
  }
};
const db = require('../models');
const { Op } = require('sequelize');
const { Course, Section, Resource, ResourceType } = db;

exports.listCourses = async (req, res) => {
  try {
    const courses = await db.Course.findAll({
      include: [{
        model: db.Topic,
        as: 'topic',
        attributes: ['id', 'description'],
        include: [{
          model: db.Area,
          as: 'area',
          attributes: ['id', 'description']
        }]
      }, {
        model: db.Enrollment,
        as: 'enrollments',
        attributes: ['id'],
        required: false
      }],
      attributes: [
        'id', 'title', 'courseType', 'description', 'instructor',
        'level', 'startDate', 'endDate', 'image', 'vacancies',
        'visible', 'inscricoes', 'hours', 'topicId', 'status'
      ],
      order: [['id', 'ASC']]
    });
    res.json(courses);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);

    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}

exports.getCourseCounts = async (req, res) => {
  try {
    const now = new Date();
    const active = await db.Course.count({
      where: {
        status: true,
        endDate: { [Op.gte]: now }
      }
    });
    const finished = await db.Course.count({
      where: {
        inscricoes: false,
        status: false
      }
    });
    return res.json({ active, finished });
  } catch (error) {
    console.error('Erro ao buscar contagem de cursos:', error);
    return res.status(500).json({
      message: 'Erro interno',
      error: error.message
    });
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    const { categoriaId, areaId, topicoId, search } = req.query;
    const now = new Date();
    const filter = {
      status: true,
      visible: true,
      inscricoes: true,
      endDate: { [Op.gte]: now },
    };

    if (search) {
      filter.title = { [Op.iLike]: `%${search}%` };
    }

    const topicRequired = Boolean(topicoId || areaId || categoriaId);
    const include = [{
      model: db.Topic,
      as: 'topic',
      required: topicRequired,
      attributes: ['id', 'description'],
      where: topicoId ? { id: topicoId } : null,
      include: [{
        model: db.Area,
        as: 'area',
        required: Boolean(areaId || categoriaId),
        attributes: ['id', 'description'],
        where: areaId ? { id: areaId } : null,
        include: [{
          model: db.Category,
          as: 'category',
          required: Boolean(categoriaId),
          attributes: ['id', 'description'],
          where: categoriaId ? { id: categoriaId } : null
        }]
      }]
    }];

    const courses = await db.Course.findAll({
      where: filter,
      include,
      attributes: [
        'id', 'title', 'description', 'instructor',
        'level', 'startDate', 'endDate',
        'image', 'vacancies', 'courseType'
      ],
      order: [['startDate', 'ASC']]
    });

    res.json(courses);
  } catch (error) {
    console.error('Erro ao buscar cursos disponíveis:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

exports.listFormadorCourses = async (req, res) => {
  try {
    const instructorWorkerNumber = req.user.workerNumber;
    const courses = await db.Course.findAll({
      where: { instructor: instructorWorkerNumber },
      attributes: ['id', 'title', 'status'],
      order: [['id', 'ASC']]
    });

    const response = courses.map(course => ({
      id: course.id,
      name: course.title,
      status: course.status ? 'Ativo' : 'Inativo'
    }));

    res.json(response);
  } catch (error) {
    console.error('Erro ao listar cursos do formador:', error);
    res.status(500).json({
      message: 'Erro ao carregar cursos',
      error: error.message
    });
  }
};

exports.getFormadorStats = async (req, res) => {
  try {
    const instructorWorkerNumber = req.user.workerNumber;
    
    const activeStatusCourses = await db.Course.count({
      where: {
        instructor: instructorWorkerNumber,
        status: true
      }
    });

    const finishedCourses = await db.Course.count({
      where: {
        instructor: instructorWorkerNumber,
        [Op.and]: [
          { inscricoes: false },
          { status: false }
        ]
      }
    });

    return res.json({
      activeStatusCourses,
      finishedCourses
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do formador:', error);
    return res.status(500).json({
      message: 'Erro interno',
      error: error.message
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db.Course.findByPk(id);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }

    const enrollmentsCount = await db.Enrollment.count({
      where: { courseId: id }
    });

    if (enrollmentsCount > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir um curso com inscrições ativas'
      });
    }

    await course.destroy();
    return res.json({ message: 'Curso excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao excluir curso', 
      error: error.message 
    });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const {
      title, description, topicId, level, startDate, endDate,
      vacancies, instructor, hours, courseType, visible = true,
      status = true, image = null
    } = req.body;

    if (!title || !description || !topicId || !level || !startDate || !endDate) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Data de início posterior à data de término' });
    }

    const newCourse = await db.Course.create({
      title, description, topicId, level, startDate, endDate,
      vacancies: vacancies || null, instructor, hours: hours || null,
      courseType: courseType !== undefined ? courseType : true,
      visible, status, image
    });

    const courseWithAssociations = await db.Course.findByPk(newCourse.id, {
      include: [{
        model: db.Topic,
        as: 'topic',
        attributes: ['id', 'description'],
        include: [{ model: db.Area, as: 'area', attributes: ['id', 'description'] }]
      }, {
        model: db.Enrollment,
        as: 'enrollments',
        attributes: ['id'],
        required: false
      }]
    });

    return res.status(201).json(courseWithAssociations);
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    return res.status(500).json({
      message: 'Erro interno ao criar curso',
      error: error.message
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNumber = parseInt(userId, 10);
    
    if (isNaN(userIdNumber)) {
      return res.status(400).json({ message: 'ID do utilizador inválido' });
    }

    const enrollments = await db.Enrollment.findAll({
      where: { userId: userIdNumber, status: { [Op.in]: ['Ativo', 'Pendente'] } },
      include: [{
        model: db.Course,
        as: 'course',
        include: [{
          model: db.Topic,
          as: 'topic',
          attributes: ['id', 'description']
        }]
      }]
    });

    const courses = enrollments
      .map(e => {
        if (!e.course) return null;
        return { ...e.course.toJSON(), enrollmentStatus: e.status };
      })
      .filter(Boolean);
    console.log('Cursos inscritos retornados:', courses);
    res.json(courses);
  } catch (error) {
    console.error('Erro ao buscar cursos inscritos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await db.Course.findByPk(id, {
      attributes: [
        'id', 'title', 'description', 'instructor', 'level',
        'startDate', 'endDate', 'image', 'vacancies',
        'courseType', 'visible', 'status', 'hours', 'topicId'
      ],
      include: [
        {
          model: db.Topic,
          as: 'topic',
          attributes: ['id', 'description'],
          include: [
            {
              model: db.Area,
              as: 'area',
              attributes: ['id', 'description'],
              include: [
                {
                  model: db.Category,
                  as: 'category',
                  attributes: ['id', 'description']
                }
              ]
            }
          ]
        },
        {
          model: db.Enrollment,
          as: 'enrollments',
          attributes: ['id', 'userId'],
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'workerNumber', 'name', 'email']
            }
          ]
        },
        {
          model: db.Section,
          as: 'sections',
          include: [
            {
              model: db.Resource,
              as: 'resources',
              include: [
                {
                  model: db.ResourceType,
                  as: 'ResourceType'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'Curso não encontrado' });
    }
    
    const totalEnrollments = await db.Enrollment.count({
      where: { 
        courseId: id,
        status: { [Op.in]: ['Ativo', 'Pendente'] }
      }
    });

    let isEnrolled = false;
    let enrollmentStatus = null;
    if (userId) {
      const enrollment = await db.Enrollment.findOne({
        where: { 
          courseId: id,
          userId: userId,
          status: { [Op.in]: ['Ativo', 'Pendente'] } 
        }
      });
      isEnrolled = !!enrollment;
      enrollmentStatus = enrollment ? enrollment.status : null;
    }

    return res.json({
      success: true,
      course,
      totalEnrollments,
      isEnrolled,
      enrollmentStatus
    });
    
  } catch (error) {
    console.error('Erro ao obter detalhes do curso:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};


exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, topicId, level, startDate, endDate, vacancies, 
          instructor, status, visible, hours, image, sections } = req.body;

  let transaction;
  try {
    transaction = await db.sequelize.transaction();

    const [updated] = await Course.update({
      title, description, topicId, level, startDate, endDate, vacancies,
      instructor, status, visible, hours, image
    }, { where: { id }, transaction });

    if (!updated) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Curso não encontrado' });
    }

    const existingSectionIds = new Set();
    const existingResourceIds = new Set();

    if (sections && Array.isArray(sections) && sections.length > 0) {

      const existingSections = [];
      const newSections = [];
      
      for (const sectionData of sections) {
        if (sectionData.id) {
          existingSections.push(sectionData);
          existingSectionIds.add(sectionData.id);
        } else {
          newSections.push(sectionData);
        }
      }
      
      if (existingSections.length > 0) {
        await Section.updateOrdersSafely(id, existingSections);
      }
      
      for (const sectionData of existingSections) {
        const section = await Section.findByPk(sectionData.id, { transaction });
        await section.update({
          title: sectionData.title,
          status: sectionData.status
        }, { transaction });
      }
      
      for (const sectionData of newSections) {
        const section = await Section.create({
          title: sectionData.title,
          order: sectionData.order,
          status: sectionData.status,
          courseId: id
        }, { transaction });
        existingSectionIds.add(section.id);
      }
      
      for (const sectionData of sections) {
        const resources = sectionData.resources || [];
        const section = sectionData.id 
          ? await Section.findByPk(sectionData.id, { transaction })
          : await Section.findOne({ 
              where: { 
                courseId: id, 
                title: sectionData.title,
                order: sectionData.order 
              }, 
              transaction 
            });

        for (const resourceData of resources) {
          try {
            const newResource = await Resource.create({
              title: resourceData.title,
              text: resourceData.text,
              file: resourceData.file,
              link: resourceData.link,
              order: resourceData.order,
              typeId: resourceData.typeId,
              sectionId: section.id
            }, { transaction });
            existingResourceIds.add(newResource.id);
          } catch (err) {
            console.error('Erro ao criar recurso:', err);
          }
        }
      }

      await Resource.destroy({
        where: {
          sectionId: Array.from(existingSectionIds),
          id: { [Op.notIn]: Array.from(existingResourceIds) }
        },
        transaction
      });

      await Section.destroy({
        where: {
          courseId: id,
          id: { [Op.notIn]: Array.from(existingSectionIds) }
        },
        transaction
      });
    }

    await transaction.commit();

    const updatedCourse = await Course.findByPk(id, {
      include: [{
        model: Section,
        as: 'sections',
        include: [{
          model: Resource,
          as: 'resources',
          include: [{
            model: ResourceType,
            as: 'ResourceType'
          }]
        }]
      }]
    });

    return res.json(updatedCourse);

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Erro ao editar curso:', error);
    return res.status(500).json({ 
      message: 'Erro interno ao editar curso', 
      error: error.message 
    });
  }
};

exports.createResource = async (req, res) => {
  try {
    const { sectionId, typeId, title, file, text, link, order } = req.body;
    if (!sectionId || !typeId || !title || !file) {
      return res.status(400).json({ message: 'Campos obrigatórios em falta.' });
    }
    const resource = await Resource.create({
      sectionId,
      typeId,
      title,
      file,
      text: text || '',
      link: link || '',
      order: order || 1
    });
    return res.status(201).json({ success: true, resource });
  } catch (error) {
    console.error('Erro ao criar recurso:', error);
    return res.status(500).json({ message: 'Erro ao criar recurso', error: error.message });
  }
};