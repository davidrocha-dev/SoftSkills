// src/controllers/gestorController.js
const bcrypt = require('bcrypt');
const { User, Enrollment, Course, Certificate } = require('../models');
const { Op, fn, col} = require('sequelize');
const sequelize = require('../config/database');  

async function createUser(req, res) {
  try {
    const { workerNumber, name, email, password, primaryRole } = req.body;
    const errors = [];
    if (!workerNumber || workerNumber.trim() === '') {
      errors.push('Nº Trabalhador é obrigatório');
    }
    if (!name || name.trim().length < 3) {
      errors.push('Nome completo deve ter pelo menos 3 caracteres');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Email inválido');
    }
    if (!password || password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
    const validRoles = ['gestor', 'formador', 'formando'];
    if (!primaryRole || !validRoles.includes(primaryRole)) {
      errors.push('Função inválida');
    }
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Erro de validação', errors });
    }
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ workerNumber }, { email }]
      }
    });
    if (existing) {
      const field = existing.workerNumber === workerNumber ? 'workerNumber' : 'email';
      return res.status(400).json({
        message: 'Usuário já existe',
        field,
        value: field === 'workerNumber' ? workerNumber : email
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      workerNumber: workerNumber.toString(),
      name,
      email,
      password: hashedPassword,
      primaryRole,
      status: true
    });
    return res.status(201).json({ id: user.id, message: 'Usuário criado com sucesso' });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Violação de restrição única', fields: err.fields });
    }
    return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const { page = 1, pageSize = 10, search = '', status, role } = req.query;
    const offset = (page - 1) * pageSize;
    const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { workerNumber: { [Op.like]: `%${search}%` } },
          
          // Adicionar pesquisa por ID se for número
          ...(!isNaN(search) ? [{ id: parseInt(search) }] : [])
        ];
      }
    if (status !== undefined) {
      whereClause.status = status === 'true';
    }
    if (role && role !== 'todos') {
      whereClause.primaryRole = role;
    }
    const { count, rows } = await User.findAndCountAll({
      where:      whereClause,
      attributes: ['id','workerNumber','name','email','primaryRole','status'],
      offset:     parseInt(offset),
      limit:      parseInt(pageSize),
      order:      [['name','ASC']]
    });
    res.json({
      total:       count,
      totalPages:  Math.ceil(count / pageSize),
      currentPage: parseInt(page),
      users:       rows
    });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    await user.update({ status });
    res.json({ message: 'Status atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { workerNumber, name, email, primaryRole } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    user.workerNumber = workerNumber;
    user.name         = name;
    user.email        = email;
    user.primaryRole  = primaryRole;
    await user.save();
    return res.json({ message: 'Usuário atualizado com sucesso', user });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

async function countUsersByRole(req, res) {
  try {

    const rows = await User.findAll({
      attributes: [

        ['tipo_utilizador', 'primaryRole'],

        [ fn('COUNT', col('tipo_utilizador')), 'count' ]
      ],
      where: {
        status: true, 
        isVerified: true, 
      },
      group: ['tipo_utilizador']
    });

    const result = { gestor: 0, formador: 0, formando: 0 };
    rows.forEach(r => {
      const role = r.get('primaryRole');
      result[role] = parseInt(r.get('count'), 10);
    });

    return res.json(result);
  } catch (err) {
    console.error('Erro ao contar usuários:', err.stack);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

async function getUserDetails(req, res) {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'workerNumber', 'name', 'email', 'primaryRole', 'status', 'pfp']
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilizador não encontrado' });
    }

    // Buscar inscrições em cursos
    const enrollments = await Enrollment.findAll({
      where: { userId: user.id },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'hours']
      }]
    });

    // Buscar certificados para obter as notas
    const certificates = await Certificate.findAll({
      where: { workerNumber: user.workerNumber },
      attributes: ['courseId', 'grade']
    });

    // Criar um mapa de notas por curso
    const gradeMap = {};
    certificates.forEach(cert => {
      gradeMap[cert.courseId] = cert.grade;
    });

    return res.json({
      success: true,
      user,
      enrollments: enrollments.map(e => ({
        courseId: e.course.id,
        courseTitle: e.course.title,
        horas: e.course.hours,
        grade: gradeMap[e.course.id] || null
      }))
    });
  } catch (err) {
    console.error('Erro ao obter detalhes do utilizador:', err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

module.exports = {
  createUser,
  listUsers,
  updateUserStatus,
  updateUser,
  countUsersByRole,
  getUserDetails
};
